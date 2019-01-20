const express = require("express");
const bcrypt = require("bcryptjs");
const check = require("check-types");

const config = require(`${process.cwd()}/config/config`);
const Database = require("./db");
const User = require("./models/user");

const router = express.Router();

class API {
    constructor() {

        // route middleware to verify user is admin
        router.use(function (req, res, next) {
            var that = this;

            var token = req.body.token || JSON.parse(req.query.token);
            //get param

            var userID = token.id;
            //var userID = req.query.id;

            //check param
            if (!userID) {
                res.send(that.makeError("MISSING_PARAMS"));
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
                    return user.findUserById(userID);
                })
                .then(userFound => {
                    if (!userFound) return Promise.reject(new Error("USER_NOT_EXIST"));
                    if (userFound.type !== 'ADMIN') return Promise.reject(new Error("NOT_PERMIT"));
                    next();
                })
                .catch(err => {
                    console.log(err);
                    res.send(that.makeError(err.message));
                })
                .then(function () {
                    database.closeDB();
                });
        });

        router.post("/register", (req, res) => {
            // get params
            var email = req.body.email;
            var password = req.body.password;
            var type = req.body.type;
            var state = req.body.state;

            console.log(email ,password ,type ,state)

            // check params
            if (!email || !password || !type || typeof state === 'undefined') {
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

            // type check
            if (!check.string(type) ||
                !check.nonEmptyString(type) ||
                !(check.match(type, /^USER$/) || check.match(type, /^ADMIN$/))
            ) {
                res.send(this.makeError("NOT_VALID_TYPE"));
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
                    return user.createUser(email, passwordHashed, type, state);
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

        router.get("/get", (req, res) => {
            var that = this;

            //get param
            var userID = req.query.id;

            //check param
            if (!userID) {
                res.send(this.makeError("MISSING_PARAMS"));
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
                    return user.findUserById(userID);
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(userFound => {
                    console.log("GET USER");
                    return res.send(that.makeSuccess({
                        user: {
                            id: userFound._id,
                            email: userFound.email,
                            type: userFound.type,
                            state: userFound.state,
                            lastConnexion: userFound.lastConnexion
                        }
                    }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function () {
                    database.closeDB();
                });

        });

        router.get("/all", (req, res) => {
            var that = this;

            var database = new Database();
            var user;

            database
                .connectDB()
                .then(db => {
                    return db.collection("users");
                })
                .then(usersCollection => {
                    user = new User(usersCollection);
                    return user.getUsers();
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(allUsers => {
                    console.log("GET USERS");
                    allUsers.forEach(function (item, index, array) {
                        array[index] = {email: item.email, type: item.type, id: item._id, lastConnexion : item.lastConnexion, state : item.state}
                    });
                    return res.send(that.makeSuccess({users: allUsers}));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function () {
                    database.closeDB();
                });

        });

        router.post("/update", (req, res) => {
            // get params
            var id = req.body.id;

            var values = {};
            values.email = req.body.valuesToUpdate.email;
            values.password = req.body.valuesToUpdate.password;
            values.type = req.body.valuesToUpdate.type;
            values.state = req.body.valuesToUpdate.state;


            if (values.email === undefined &&
                values.password === undefined &&
                values.type === undefined &&
                values.state === undefined) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            if(!(values.email === undefined)){
                // email check
                if (!check.string(values.email) ||
                    !check.nonEmptyString(values.email) ||
                    !check.match(email, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
                ) {
                    res.send(this.makeError("NOT_VALID_MAIL"));
                    return;
                }
            }

            if(!(values.password === undefined)){
                // password check
                if (!check.string(values.password) ||
                    !check.nonEmptyString(values.password) ||
                    !check.match(values.password, /^\s*(\S\s*){4,20}$/)
                ) {
                    res.send(this.makeError("NOT_VALID_PASSWORD"));
                    return;
                }
            }


            // check params
            if (!id || values.length === 0) {
                res.send(this.makeError("MISSING_PARAMS"));
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
                    if(!(values.password === undefined)) return bcrypt.hash(values.password, config.serverConfig.crypto.saltRound);
                })
                .then(passwordHashed => {
                    if(!passwordHashed) return user.update(id, values);
                    values.password = passwordHashed;
                    return user.update(id, values);
                })
                .then(updatedUser => {
                    if (!updatedUser) {
                        return Promise.reject(new Error("USER_NOT_EXIST"));
                    }
                    var user = {
                        id: updatedUser.value._id,
                        email: updatedUser.value.email,
                        type: updatedUser.value.type,
                        state: updatedUser.value.state,
                        lastConnexion: updatedUser.value.lastConnexion
                    };

                    console.log("UPDATED USER");
                    res.send(this.makeSuccess({user: user}));
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
