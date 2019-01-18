const express = require("express");
const check = require("check-types");

const Database = require("./db");
const Playlist = require("./models/playlist");
const Video = require("./models/video");

const router = express.Router();

class APIPlaylist {
    constructor() {
        router.get("/all", (req, res) => {
            var that = this;

            //get param
            var userID = JSON.parse(req.query.token).id;

            //check param
            if (!userID) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            var database = new Database();
            var playlist;

            database
                .connectDB()
                .then(db => {
                    return db.collection("playlists");
                })
                .then(playlistsCollection => {
                    playlist = new Playlist(playlistsCollection);
                    return playlist.getPlaylists(userID);
                })
                .then(allPlaylists => {
                    console.log("GET PLAYLISTS");
                    return res.send(that.makeSuccess({ playlists: allPlaylists }));
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
            var idPlaylist, userID;

            try {
                idPlaylist = req.query.idPlaylist;
                userID = JSON.parse(req.query.token).id;

                if (!idPlaylist || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // idPlaylist check
            if (!check.string(idPlaylist) ||
                !check.nonEmptyString(idPlaylist)
            ) {
                res.send(this.makeError("NOT_VALID_PLAYLIST_ID"));
                return;
            }

            var database = new Database();
            var video, playlist;

            database
                .connectDB()
                .then(db => {
                    var videos = db.collection("videos");
                    var playlists = db.collection("playlists");
                    return [videos, playlists];
                })
                .then(([videosCollection, playlistsCollection]) => {
                    video = new Video(videosCollection);
                    playlist = new Playlist(playlistsCollection);
                    return playlist.checkPlaylist(idPlaylist, userID);
                })
                .then(foundPlaylist => {
                    if (!foundPlaylist) {
                        return Promise.reject(new Error("PLAYLIST_NOT_EXIST"));
                    }
                    return video.getVideos(idPlaylist, userID, null).then(allVideos => {
                        foundPlaylist.videos = allVideos;
                        return res.send(that.makeSuccess({ playlist: foundPlaylist }));
                    });
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
            var name, userID;

            try {
                name = req.body.playlist.name;
                userID = req.body.token.id;


                //if (!name || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // name check

            console.log(!check.string(name));
            console.log(!check.nonEmptyString(name));
            console.log(!check.match(name, /^\s*(\S\s*){1,25}$/));

            if (!check.string(name) ||
                !check.nonEmptyString(name) ||
                !check.match(name, /^\s*(\S\s*){1,25}$/)
            ) {
                res.send(this.makeError("NOT_VALID_PLAYLIST_NAME"));
                return;
            }

            var database = new Database();
            var playlist;

            database
                .connectDB()
                .then(db => {
                    return db.collection("playlists");
                })
                .then(playlistsCollection => {
                    playlist = new Playlist(playlistsCollection);
                    return playlist.createPlaylist(name, userID);
                })
                .then(newPlaylist => {
                    console.log("CREATED PLAYLIST");
                    return res.send(that.makeSuccess({ playlist: newPlaylist.ops[0] }));
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
            var playlistID, newName, userID;

            try {
                playlistID = req.body.playlist.id;
                newName = req.body.playlist.name;
                userID = req.body.token.id;

                if (!playlistID || !userID) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            // name check
            if (check.string(newName) &&
                (!check.nonEmptyString(newName) ||
                    !check.match(newName, /^\s*(\S\s*){1,25}$/)
                )) {
                res.send(this.makeError("NOT_VALID_PLAYLIST_NAME"));
                return;
            }

            var database = new Database();
            var playlist;

            database
                .connectDB()
                .then(db => {
                    return db.collection("playlists");
                })
                .then(playlistsCollection => {
                    playlist = new Playlist(playlistsCollection);

                    var values = {};

                    // add data to update
                    if (newName) {
                        values.name = newName;
                    }

                    // we will also check if video € user before update
                    var otherFilter = { userID: userID };

                    return playlist.updatePlaylist(playlistID, otherFilter, values);
                })
                .then(updatedPlaylist => {
                    if (!updatedPlaylist.value) {
                        return Promise.reject(new Error("LIST_NOT_EXIST"));
                    }

                    console.log("UPDATED LIST");
                    return res.send(that.makeSuccess({ playlist: updatedPlaylist.value }));
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
            var playlistID = req.body.playlist._id;
            var userID = req.body.token.id;

            //check param
            if (!playlistID || !userID) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            var database = new Database();
            var video, playlist;

            database
                .connectDB()
                .then(db => {
                    var videos = db.collection("videos");
                    var playlists = db.collection("playlists");
                    return [videos, playlists];
                })
                .then(([videosCollection, playlistsCollection]) => {
                    video = new Video(videosCollection);
                    playlist = new Playlist(playlistsCollection);

                    var values = {};

                    // try to find the new playlist
                    if (typeof playlistID !== "undefined") {
                        return playlist.checkPlaylist(playlistID, userID).then(foundPlaylist => {
                            if (!foundPlaylist) {
                                return Promise.reject(new Error("PLAYLIST_NOT_EXIST"));
                            }
                            values.idPlaylist = playlistID;
                            return [video, playlist, values];
                        });
                    }

                    return [video, playlist, values];
                })
                .then(([video, playlist, values]) => {
                    return video
                        .deleteVideos(playlistID, { userID: userID })
                        .then(deletedVideos => {
                            return [playlist, deletedVideos];
                        });
                })
                .then(([playlist, deletedVideos]) => {
                    return playlist
                        .deletePlaylist(playlistID, { userID: userID })
                        .then(deletedPlaylist => {
                            return [deletedVideos.deletedCount, deletedPlaylist];
                        });
                })
                .then(([nbVideosDeleted, deletedPlaylist]) => {
                    // because we already check playlistID exist, no need to recheck
                    console.log("REMOVED LIST");
                    return res.send(that.makeSuccess({
                        nbVideosDeleted: nbVideosDeleted
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

module.exports.api = new APIPlaylist();
module.exports.router = router;