const ObjectID = require("mongodb").ObjectID;
const sanitize = require("mongo-sanitize");

class Video {
    constructor(collection) {
        const that = this;
        that.collection = collection;
    }

    createVideo(userID, playlistID, channelId, channelTitle, description, videoId, link, publishedAt, thumbnails, title, brand) {
        const that = this;
        const Video = {
            userID: userID,
            playlistID: playlistID,
            channelId: channelId,
            channelTitle: channelTitle,
            description: description,
            videoId: videoId,
            link: link,
            publishedAt: publishedAt,
            thumbnails: thumbnails,
            title: title,
            brand: brand
        };
        return that.collection.insertOne(Video);
    }

    updateVideo(VideoID, filters, newVideoValues) {
        const that = this;
        if (!ObjectID.isValid(VideoID)) {
            return Promise.reject(new Error("INVALID_VIDEO_ID_FORMAT"));
        }
        var myQuery = {
            _id: new ObjectID(VideoID)
        };
        Object.assign(myQuery, filters);
        if (Object.keys(newVideoValues).length === 0 && newVideoValues.constructor === Object) {
            return Promise.reject(new Error("NO_PROPERTY_WAS_PROVIDED_TO_UPDATE"));
        }
        return that.collection.findOneAndUpdate(myQuery, { $set: newVideoValues }, { returnOriginal: false });
    }

    deleteVideo(VideoID, filters) {
        const that = this;
        if (!ObjectID.isValid(VideoID)) {
            return Promise.reject(new Error("INVALID_Video_ID_FORMAT"));
        }
        var myQuery = { _id: new ObjectID(VideoID) };
        Object.assign(myQuery, filters);
        return that.collection.deleteOne(myQuery);
    }

    deleteVideos(playlistID, filters) {
        const that = this;
        if (!ObjectID.isValid(playlistID)) {
            return Promise.reject(new Error("INVALID_PLAYLIST_ID_FORMAT"));
        }
        var myQuery = { playlistID: playlistID };
        Object.assign(myQuery, filters);
        return that.collection.deleteMany(myQuery);
    }

    getVideos(playlistID, userID) {
        const that = this;
        if (!ObjectID.isValid(playlistID)) {
            return Promise.reject(new Error("INVALID_PLAYLIST_ID_FORMAT"));
        }
        const query = {userID: userID , playlistID: sanitize(playlistID) };
        return that.collection.find(query).toArray();
    }
}

module.exports = Video;