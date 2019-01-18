const express = require("express");
const check = require("check-types");

const Database = require("./db");
const Historique = require("./models/historique");

const router = express.Router();

const moment = require("moment");

class ApiHistorique {
    constructor() {
        router.get("/all", (req, res) => {
            var that = this;

            //get param
            var userID, during;


            try {
                userID = JSON.parse(req.query.token).id;
                //userID = req.query.id;
                during = req.query.during || null;

                if(!userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            var database = new Database();
            var historique;

            database
                .connectDB()
                .then(db => {
                    return db.collection("historiques");
                })
                .then(historiquesCollection => {
                    historique = new Historique(historiquesCollection);

                    switch (during) {
                        case null:
                            return historique.getHistoriques(userID);
                            break;
                        case 'week':
                            return historique.getHistoriquesThisWeek(userID);
                            break;
                        case 'month':
                            return historique.getHistoriquesThisMonth(userID);
                            break;
                        default:
                            return historique.getHistoriques(userID);
                    }
                })
                .then(allHistoriques => {
                    console.log("GET HISTORIQUES");
                    return res.send(that.makeSuccess({ historiques: allHistoriques }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function() {
                    database.closeDB();
                });

        });

        router.get("/allOfUser", (req, res) => {
            var that = this;

            //get param
            var userID, user, during;


            try {
                userID = JSON.parse(req.query.token).id;
                user = req.query.id;
                during = req.query.during || null;

                if(!userID || !user) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            var database = new Database();
            var historique;

            database
                .connectDB()
                .then(db => {
                    return db.collection("historiques");
                })
                .then(historiquesCollection => {
                    historique = new Historique(historiquesCollection);

                    switch (during) {
                        case null:
                            return historique.getHistoriques(user);
                            break;
                        case 'week':
                            return historique.getHistoriquesThisWeek(user);
                            break;
                        case 'month':
                            return historique.getHistoriquesThisMonth(user);
                            break;
                        case 'all':
                            return Promise.all([historique.getHistoriques(user), historique.getHistoriquesThisMonth(user), historique.getHistoriquesThisWeek(user)]);
                        default:
                            return historique.getHistoriques(user);
                    }
                })
                .then(allHistoriques => {
                    console.log("GET HISTORIQUES");
                    return res.send(that.makeSuccess({ historiques: allHistoriques }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function() {
                    database.closeDB();
                });

        });

        router.get("/get", (req, res) => {
            var that = this;

            //get param
            var idHistorique, userID;

            try {
                idHistorique = req.query.idHistorique;
                userID = JSON.parse(req.query.token).id;

                if (!idHistorique || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // idHistorique check
            if (!check.string(idHistorique) ||
                !check.nonEmptyString(idHistorique)
            ) {
                res.send(this.makeError("NOT_VALID_HISTORIQUE_ID"));
                return;
            }

            var database = new Database();
            var historique;

            database
                .connectDB()
                .then(db => {

                    var historiques = db.collection("historiques");
                    return historiques;
                })
                .then((historiquesCollection) => {
                    historique = new Historique(historiquesCollection);
                    return historique.checkHistorique(idHistorique, userID);
                })
                .then(foundHistorique => {
                    if (!foundHistorique) {
                        return Promise.reject(new Error("HISTORIQUE_NOT_EXIST"));
                    }
                    return res.send(that.makeSuccess({ historique: foundHistorique }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function() {
                    database.closeDB();
                });
        });

        router.post("/add", (req, res) => {
            var that = this;

            //get param
            var research, userID;

            console.log(req.body);

            try {
                research = req.body.historique.research;
                userID = req.body.token.id;

                //research = req.body.research;
                //userID = req.body.id;

                if (!research || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // research check
            if (!check.string(research) ||
                !check.nonEmptyString(research) ||
                !check.match(research, /^\s*(\S\s*){1,25}$/)
            ) {
                res.send(this.makeError("NOT_VALID_HISTORIQUE_RESEARCH"));
                return;
            }

            var database = new Database();
            var historique;

            database
                .connectDB()
                .then(db => {
                    return db.collection("historiques");
                })
                .then(historiquesCollection => {
                    historique = new Historique(historiquesCollection);
                    return historique.createHistorique(research, userID);
                })
                .then(newHistorique => {
                    console.log("CREATED HISTORIQUE");
                    return res.send(that.makeSuccess({ historique: newHistorique.ops[0] }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function() {
                    database.closeDB();
                });

        });

        router.post("/update", (req, res) => {
            var that = this;

            //get param
            var historiqueID, newResearch, userID;

            try {
                historiqueID = req.body.historique.id;
                newResearch = req.body.historique.research;
                userID = req.body.token.id;

                if (!historiqueID || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // name check
            if (check.string(newResearch) &&
                (!check.nonEmptyString(newResearch) ||
                    !check.match(newResearch, /^\s*(\S\s*){1,25}$/)
                )) {
                res.send(this.makeError("NOT_VALID_HISTORIQUE_NAME"));
                return;
            }

            var database = new Database();
            var historique;

            database
                .connectDB()
                .then(db => {
                    return db.collection("historiques");
                })
                .then(historiquesCollection => {
                    historique = new Historique(historiquesCollection);

                    var values = {};

                    // add data to update
                    if (newResearch) {
                        values.name = newResearch;
                    }

                    // we will also check if video € user before update
                    var otherFilter = { userID: userID };

                    return historique.updateHistorique(historiqueID, otherFilter, values);
                })
                .then(updatedHistorique => {
                    if (!updatedHistorique.value) {
                        return Promise.reject(new Error("LIST_NOT_EXIST"));
                    }

                    console.log("UPDATED LIST");
                    return res.send(that.makeSuccess({ historique: updatedHistorique.value }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function() {
                    database.closeDB();
                });

        });

        router.post("/delete", (req, res) => {
            var that = this;

            //get param
            var historiqueID, userID;

            try {
                historiqueID = req.body.historique._id;
                userID = req.body.token.id;

                //historiqueID = req.body.idHist;
                //userID = req.body.id;

                if(!userID || !historiqueID) throw "";
            }catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            //check param
            if (!historiqueID || !userID) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            var database = new Database();
            var video, historique;

            database
                .connectDB()
                .then(db => {
                    var historiques = db.collection("historiques");
                    return historiques;
                })
                .then((historiquesCollection) => {
                    historique = new Historique(historiquesCollection);
                    var values = {};

                    // try to find the new historique
                    if (typeof historiqueID !== "undefined") {
                        return historique.checkHistorique(historiqueID, userID).then(foundHistorique => {
                            if (!foundHistorique) {
                                return Promise.reject(new Error("HISTORIQUE_NOT_EXIST"));
                            }
                            values.idHistorique = historiqueID;
                            return [historique, values];
                        });
                    }

                    return [historique, values];
                })
                .then(([historique, values]) => {
                    return historique
                        .deleteHistorique(historiqueID, { userID: userID })
                        .then(deletedHistorique => {
                            return deletedHistorique;
                        });
                })
                .then((deletedHistorique) => {
                    // because we already check historiqueID exist, no need to recheck
                    console.log("REMOVED HISTORIQUE");
                    return res.send(that.makeSuccess({
                        deletedHistorique: deletedHistorique
                    }));
                })
                .catch(err => {
                    console.log(err);
                    res.send(this.makeError(err.message));
                    return;
                })
                .then(function() {
                    database.closeDB();
                });

        });
    }

    makeError(errors) {
        return { success: false, error: errors };
    }

    makeSuccess(data) {
        return { success: true, data: data };
    }
}

module.exports.api = new ApiHistorique();
module.exports.router = router;