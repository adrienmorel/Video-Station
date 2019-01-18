const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const ExpressBrute = require("express-brute")

const APINoAuth = require("./api.noauth");
const API = require("./api");
const config = require(`${process.cwd()}/config/config`);
const JSMinifier = require("./minifier");

class Server {
	constructor() {
		this.server = express();
		
		this.server.use(bodyParser.json());
		this.server.use(
			bodyParser.urlencoded({
				extended: true
			})
		);
		
		// brute force
		this.store = new ExpressBrute.MemoryStore();
		
		// no more than x login attempts
		this.userBruteforce = new ExpressBrute(this.store, {
			freeRetries: config.serverConfig.server.security.bruteforce.user.freeRetries,
			minWait: config.serverConfig.server.security.bruteforce.user.minWait,
			maxWait: config.serverConfig.server.security.bruteforce.user.maxWait,
			failCallback: this.failCallback,
			handleStoreError: this.handleStoreError
		});
		
		// no more than x requests per y per IP
		this.globalBruteforce = new ExpressBrute(this.store, {
			freeRetries: config.serverConfig.server.security.bruteforce.global.freeRetries,
			attachResetToRequest: false,
			refreshTimeoutOnRequest: false,
			minWait: config.serverConfig.server.security.bruteforce.global.minWait,
			maxWait: config.serverConfig.server.security.bruteforce.global.maxWait,
			lifetime: config.serverConfig.server.security.bruteforce.global.lifetime,
			failCallback: this.failCallback,
			handleStoreError: this.handleStoreError
		});
		
		// serve default page
		this.server.get("/", (req, res) => {
			res.send(
				fs.readFileSync(
					path.join(
						process.cwd(),
						`${config.serverConfig.server.public.root}/index.html`
					),
					"utf8"
				)
			);
		});
		
		// authorize access to public directory to server html, css, js
		this.server.use(
			"/js",
			express.static(
				path.join(process.cwd(), `${config.serverConfig.server.public.js}`)
			)
		);


		// authorize access to public directory to server html, css, js
		this.server.use(
			"/assets",
			express.static(
				path.join(process.cwd(), `${config.serverConfig.server.public.assets}`)
			)
		);

		this.server.use(
			"/blockUI",
			express.static(
				path.join(process.cwd(), `${config.serverConfig.server.public.blockUI}`)
			)
		);

		this.server.use(
			"/css",
			express.static(
				path.join(process.cwd(), `${config.serverConfig.server.public.css}`)
			)
		);
		this.server.use(
			"/template",
			express.static(
				path.join(
					process.cwd(),
					`${config.serverConfig.server.public.template}`
				)
			)
		);
		
		JSMinifier.update();
		
		this.server.get("/js.min", (req, res) => {
			//js.min
			res.send(fs.readFileSync(path.join(process.cwd(), `${config.serverConfig.server.public.js}/${config.serverConfig.server.minifier.js.raw}`), "utf8"));
		});
		
		// unauthentificated routes
		var unauthentificatedAPI = new APINoAuth(
			this.globalBruteforce,
			this.userBruteforce
		);
		this.server.use(
			`/${config.serverConfig.server.api}`,
			unauthentificatedAPI.router
		);
		// authentificated routes
		var authentificatedAPI = new API(
			this.globalBruteforce
		);
		this.server.use(
			`/${config.serverConfig.server.api}`,
			authentificatedAPI.router
		);
	}
	
	start(host, port) {
		const options = {
			key: fs.readFileSync(config.serverConfig.server.security.ssl.key),
			cert: fs.readFileSync(config.serverConfig.server.security.ssl.cert)
		};
		
		https.createServer(options, this.server).listen(port, host, () => {
			console.log(`Listening on '${host}' on the port ${port}...`);
		});
	}
	
	failCallback(req, res, next, nextValidRequestDate) {
		console.log("TOO_MANY_ATTEMPTS");
		res
		.status(429)
		.send({ success: false, error: "TOO_MANY_ATTEMPTS" });
	}
	
	handleStoreError(error) {
		console.log(`handleStoreError: ${error}`);
		throw {
			message: error.message,
			parent: error.parent
		};
	}
}

module.exports = new Server();
