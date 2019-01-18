const jwt = require("jsonwebtoken");
const config = require(`${process.cwd()}/config/config`);

class Token {
	constructor() {
		
	}
	
	create(idUser) {
		
		var payload = { id: idUser };
		var token = jwt.sign(
			payload,
			config.serverConfig.server.token.secret,
			{
				expiresIn: config.serverConfig.server.token.expire
			}
		);
		return token;
		
	}
	
	verify(token) {
		return new Promise((resolve, reject) => {
			
			jwt.verify(token, config.serverConfig.server.token.secret, function(err, decoded) {
				if (err) {
					reject(new Error(err.message));
				} else {
					resolve(decoded);
				}
			});

		});
	}
	
}

module.exports = new Token();
