const express = require("express");
const bcrypt = require("bcryptjs");
const check = require("check-types");

const config = require(`${process.cwd()}/config/config`);
const Database = require("./db");
const User = require("./models/user");

const router = express.Router();

class API {
    constructor() {
        router.post("/register", (req, res) => {
            // get params
            var email = req.body.email;
            var password = req.body.password;


            //var email = "adrien@gmail.com";
            //var password = "test";

            // check params
            if (!email || !password) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // email check
            if (!check.string(email) ||
                !check.nonEmptyString(email) ||
                !check.match(email, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ) {
                res.send(this.makeError("NOT_VALID_MAIL"));
                return;
            }

            // password check
            if (!check.string(password) ||
                !check.nonEmptyString(password) ||
                !check.match(password, /^\s*(\S\s*){4,20}$/)
            ) {
                res.send(this.makeError("NOT_VALID_PASSWORD"));
                return;
            }

            var database = new Database();
            var user;

            database
                .connectDB()
                .then(db => {
                    return db.collection("users");
                })
                .then(usersCollection => {
                    user = new User(usersCollection);
                    return user.findUserByEmail(email);
                })
                .then(userFound => {
                    if (userFound) {
                        return Promise.reject(new Error("USER_ALREADY_EXIST"));
                    }
                    return bcrypt.hash(password, config.serverConfig.crypto.saltRound);
                })
                .then(passwordHashed => {
                    return user.createUser(email, passwordHashed);
                })
                .then(newUser => {
                    console.log("CREATE USER");
                    res.send(this.makeSuccess(`User created ${email}`));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                })
                .then(function () {
                    database.closeDB();
                });

        });

        router.post("/login", (req, res) => {

            var that = this;
            // get params
            var email = req.body.email;
            var password = req.body.password;

            // check params
            if (!email || !password) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // email check
            if (!check.string(email) ||
                !check.nonEmptyString(email) ||
                !check.match(email, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ) {
                res.send(this.makeError("NOT_VALID_MAIL"));
                return;
            }

            // password check
            if (!check.string(password) ||
                !check.nonEmptyString(password) ||
                !check.match(password, /^\s*(\S\s*){4,20}$/)
            ) {
                res.send(this.makeError("NOT_VALID_PASSWORD"));
                return;
            }

            var database = new Database();
            var user;

            database
                .connectDB()
                .then(db => {
                    return db.collection("users");
                })
                .then(usersCollection => {
                    user = new User(usersCollection);
                    return user.findUserByEmail(email);
                })
                .then(userFound => {
                    if (!userFound) {
                        return Promise.reject(new Error("USER_NOT_EXIST"));
                    }
                    var isTheSame = bcrypt
                        .compare(password, userFound.password);
                    // return both result
                    return Promise.all([userFound, isTheSame]);
                })
                .then(function ([userFound, isTheSame]) {
                    if (!isTheSame) {
                        return Promise.reject(new Error("WRONG_PASSWORD"));
                    }
                    if(!userFound.state){
                        return Promise.reject(new Error("INACTIVE_STATE"));
                    }
                    user.updateLastConnexion(userFound._id);
                    res.send(that.makeSuccess({id: userFound._id, type: userFound.type, state: userFound.state}));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                })
                .then(function () {
                    database.closeDB();
                });
        });
    }

    makeError(errors) {
        return {success: false, error: errors};
    }

    makeSuccess(data) {
        return {success: true, data: data};
    }

}

module.exports.api = new API();
module.exports.router = router;
