const express = require("express");
const check = require("check-types");

const Youtube = require("./api-external/Youtube");
const Vimeo = require("./api-external/Vimeo");

var util = require('util');

const Database = require("./db");
const Video = require("./models/video");
const Playlist = require("./models/playlist");

const router = express.Router();


class APIVideo {
    constructor() {
        router.get("/all", (req, res) => {

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
                    return video.getVideos(idPlaylist, userID);
                })
                .then(allVideos => {
                    console.log("GET VIDEO");
                    return res.send(that.makeSuccess({ videos: allVideos }));
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

        router.get("/search", (req, res) => {
            var that = this;

            //get param
            var slug, userID;

            try {
                slug = req.query.slug;
                userID = JSON.parse(req.query.token).id;

                if (!slug  || !userID ) throw "";
            } catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            //slug = this.deslugify(slug);
            console.log(slug);

            Promise.all([Vimeo.search(slug.toString().toLowerCase(), 10), Youtube.search(slug.toString().toLowerCase(),10)]).then(function (data) {
                res.send(that.makeSuccess({videos : data}))
            }).catch(function (err) {
                res.send(that.makeError(err))
            })

        });

        router.get("/get", (req, res) => {
            var that = this;

            //get param
            var id, userID, brand;

            try {
                id = req.query.id;
                userID = JSON.parse(req.query.token).id;
                brand = req.query.brand;

                if (!id || !userID || !brand ) throw "";
            } catch (e) {
                res.send(that.makeError("MISSING_PARAMS"));
                return;
            }

            switch (brand) {
                case 'Youtube':
                    Youtube.getVideoById(id)
                        .then( video => {
                            var result =  Youtube.normalize(video);
                            res.send(that.makeSuccess({ videos: result }));
                        })
                        .catch(err => {
                            res.send(that.makeError(err));
                        });
                    break;
                case 'Vimeo':
                    Vimeo.getVideoById(id).then(function (video) {
                        var result = Vimeo.normalize(video);
                        res.send(that.makeSuccess({ videos: result }));
                    }).catch(function (error) {
                        res.send(that.makeError(error));
                    });
                    break;
                default:
                    res.send(that.makeError("NO_TYPE_EXIST"));
            }
        });

        router.post("/add", (req, res) => {
            var that = this;

            //get param
            var idPlaylist, userID, channelId, channelTitle, description, videoId, link, publishedAt, thumbnails, title, brand;

            try {
                idPlaylist = req.body.idPlaylist;
                userID = req.body.token.id;
                //userID = req.body.id;

                title = req.body.video.title;
                brand = req.body.video.brand;
                channelId = req.body.video.channel.id;
                channelTitle = req.body.video.channel.title;
                description = req.body.video.description;
                videoId = req.body.video.id;
                link = req.body.video.link;
                publishedAt = req.body.video.publishedAt;
                thumbnails = req.body.video.thumbnails;


                if (!idPlaylist ||
                    !userID ||
                    !channelId ||
                    !channelTitle ||
                    (typeof description === 'undefined') ||
                    !videoId ||
                    (typeof link === 'undefined') ||
                    !brand ||
                    (typeof publishedAt === 'undefined') ||
                    (typeof thumbnails === 'undefined') ||
                    (typeof title === 'undefined')) throw "";
            } catch (e) {
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
                    return playlist.checkPlaylist(idPlaylist, userID);
                })
                .then(foundPlaylist => {
                    if (!foundPlaylist) {
                        return Promise.reject(new Error("PLAYLIST_NOT_EXIST"));
                    }
                    return video.createVideo(userID, idPlaylist,  channelId, channelTitle, description, videoId, link, publishedAt, thumbnails, title, brand);
                })
                .then(newVideo => {
                    console.log("CREATED VIDEO");
                    return res.send(that.makeSuccess({ video: newVideo.ops[0] }));
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

            var videoID, userID;

            //get param
            try {
                videoID = req.body.video.id;
                userID = req.body.token.id;

            }catch (e) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }


            //check param
            if (!videoID || !userID) {
                res.send(this.makeError("MISSING_PARAMS"));
                return;
            }

            var database = new Database();
            var video;

            database
                .connectDB()
                .then(db => {
                    return db.collection("videos");
                })
                .then(videosCollection => {
                    video = new Video(videosCollection);

                    // we will also check if video € user before update
                    var otherFilter = { userID: userID };

                    return video.deleteVideo(videoID, otherFilter);
                })
                .then(deletedVideo => {
                    // TASK_NOT_EXIST
                    if (deletedVideo.deletedCount == 0) {
                        res.send(this.makeError("TASK_NOT_EXIST"));
                        return;
                    }

                    console.log("REMOVED TASK");
                    return res.send(that.makeSuccess());
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

module.exports.api = new APIVideo();
module.exports.router = router;