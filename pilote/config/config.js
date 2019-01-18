const fs = require("fs");
const path = require("path");
const yml = require("js-yaml");

const serverConfigPath = "server-config.yml";
const silosConfigPath = "silos-config.yml";

let serverConfig;
let silosConfig;

try {
	serverConfig = yml.safeLoad(fs.readFileSync(path.join(__dirname, serverConfigPath), "utf8"));
	console.log("Server config file loaded.");
} catch (e) {
	console.log("Could not load the server config file");
	process.exit(1);
}

try {
	silosConfig = yml.safeLoad(fs.readFileSync(path.join(__dirname, silosConfigPath), "utf8"));
	console.log("Silos config file loaded.");
} catch (e) {
	console.log("Could not load the silos config file");
	process.exit(1);
}

module.exports.serverConfig = serverConfig;
module.exports.silosConfig = silosConfig;
