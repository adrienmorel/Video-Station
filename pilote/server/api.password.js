const express = require("express");
const axios = require("axios");


const router = express.Router();
const config = require(`${process.cwd()}/config/config`);
const Token = require('./token');

class API {
    constructor(globalBruteforce) {
        this.router = router;
        var silosConfig = config.silosConfig.silo;
        this.globalBruteforce = globalBruteforce;

        // global brute force, on all routes
        this.router.use(this.globalBruteforce.prevent);

        // route middleware to verify a token
        this.router.use(function(req, res, next) {
            var that = this;

            // check header or url parameters or post parameters for token
            var token = req.param("token");

            // decode token
            if (token) {
                // verifies secret and checks exp

                Token.verify(token)
                    .then(function(tokenDecoded) {
                        // if everything is good, save to request for use in other routes
                        req.body.token = req.query.token = req.headers["x-access-token"] = tokenDecoded;
                        next();
                    })
                    .catch(function(error) {
                        console.log(`Token error: ${error.message}`);
                        return res.json({
                            success: false,
                            error: "BAD_TOKEN"
                        });
                    });

            } else {
                // if there is no token
                // return an error
                return res.status(403).send({
                    success: false,
                    error: "TOKEN_NEEDED"
                });
            }
        });

        this.router.get(`/change/:token`, (req, res) => {
            var that = this;
            var userID;

            try {
                userID = JSON.parse(req.query.token).id;
                //if (!name || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            res.send(
                fs.readFileSync(
                    path.join(
                        process.cwd(),
                        `${config.serverConfig.server.public.root}/changepassword.html`
                    ),
                    "utf8"
                ),
            );
        });



    }

    makeFullEndpoint(silo, name, endpoint) {
        const fullEndpoint = `http://${silo.host}:${silo.port}/${name}/${endpoint}`;
        console.log(`Making endpoint: ${fullEndpoint}`);
        return fullEndpoint;
    }

    makeError(errors) {
        return {
            success: false,
            error: errors
        };
    }

    makeSuccess(data) {
        return {
            success: true,
            data: data
        };
    }
}

module.exports = API;