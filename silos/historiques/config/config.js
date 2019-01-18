const fs = require("fs");
const yml = require("js-yaml");
const path = require("path");

const serverConfigPath = "server-config.yml";
const databaseConfigPath = "database-config.yml";

let serverConfig;
let databaseConfig;

try {
  serverConfig = yml.safeLoad(
    fs.readFileSync(path.join(__dirname, serverConfigPath), "utf8")
  );
  console.log("Server config file loaded.");
} catch (e) {
  console.log("Could not load the server config file");
  process.exit(1);
}

try {
  databaseConfig = yml.safeLoad(
    fs.readFileSync(path.join(__dirname, databaseConfigPath), "utf8")
  );
  console.log("Database config file loaded.");
} catch (e) {
  console.log("Could not load the database config file");
  process.exit(1);
}

module.exports.serverConfig = serverConfig;
module.exports.databaseConfig = databaseConfig;
