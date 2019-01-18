const express = require("express");
const axios = require("axios");

const router = express.Router();
const config = require(`${process.cwd()}/config/config`);
const Token = require("./token");

class APINoAuth {
	constructor(globalBruteforce, userBruteforce) {
		this.router = router;
		
		this.globalBruteforce = globalBruteforce;
		this.userBruteforce = userBruteforce;
		
		var silosConfig = config.silosConfig.silo;
		
		// global brute force, on all routes
		this.router.use(this.globalBruteforce.prevent);
		
		this.router.post(
			`/${silosConfig.user.endpoints.user}/register`,
			(req, res) => {
				var that = this;
				
				axios
				.post(
					that.makeFullEndpoint(
						silosConfig.user,
						silosConfig.user.endpoints.user,
						"register"
					),
					{
						email: req.body.email,
						password: req.body.password
					}
				)
				.then(function(response) {
					res.json(response.data);
				})
				.catch(function(error) {
					res.send(that.makeError(error.message));
				});
			}
		);

		
		this.router.post(
			`/${silosConfig.user.endpoints.user}/login`,
			// apply specific bruteforce on login
			this.userBruteforce.getMiddleware({
				key: function(req, res, next) {
					// prevent too many attempts for the same email
					next(req.body.email);
				}
			}),
			(req, res) => {
				var that = this;
				axios
				.post(
					that.makeFullEndpoint(
						silosConfig.user,
						silosConfig.user.endpoints.user,
						"login"
					),
					{
						email: req.body.email,
						password: req.body.password
					}
				)
				.then(function(response) {
					let data = response.data;
					
					// an error occured
					if (!data.success) {
						res.json(data);
					} else {
						var token = Token.create(data.data.id);
						data.data.token = token;

						delete data.data.id;
						
						req.brute.reset();
						
						res.json(data);
					}
				})
				.catch(function(error) {
					res.send(that.makeError(error.message));
				});
			}
		);
		
		this.router.post(
			`/${silosConfig.user.endpoints.user}/verify`,
			(req, res) => {
				var that = this;
				
				var token = req.body.token || req.query.token || req.headers["x-access-token"];
				
				if (!token) {
					res.send(that.makeError("MISSING_PARAMS"));
					return;
				}
				
				Token.verify(token)
				.then(function(tokenDecoded) {
					// if everything is good, save to request for use in other routes
					return res.send(that.makeSuccess());
				})
				.catch(function(error) {
					console.log(`Token error: ${error.message}`);
					return res.send(that.makeError("BAD_TOKEN"));
				});
				
			}
		);


	}
	
	makeFullEndpoint(silo, name, endpoint) {
		const fullEndpoint = `http://${silo.host}:${silo.port}/${name}/${endpoint}`;
		console.log(`Making endpoint: ${fullEndpoint}`);
		return fullEndpoint;
	}
	
	makeError(errors) {
		return { success: false, error: errors };
	}
	
	makeSuccess(data) {
		return { success: true, data: data };
	}
}

module.exports = APINoAuth;