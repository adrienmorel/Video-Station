const ObjectID = require("mongodb").ObjectID;
const sanitize = require("mongo-sanitize");

class Playlist {
    constructor(collection) {
        const that = this;
        that.collection = collection;
    }

    createPlaylist(withName, ofUserID) {
        const that = this;
        return that.collection.insertOne({ userID: ofUserID, name: sanitize(withName) });
    }
    updatePlaylist(playlistID, filters, valuesToUpdate) {
        const that = this;
        if (!ObjectID.isValid(playlistID)) {
            return Promise.reject(new Error("INVALID_LIST_ID_FORMAT"));
        }
        var myQuery = { _id: new ObjectID(playlistID) };
        Object.assign(myQuery, filters);
        if (Object.keys(valuesToUpdate).length === 0 && valuesToUpdate.constructor === Object) {
            return Promise.reject(new Error("NO_PROPERTY_WAS_PROVIDED_TO_UPDATE"));
        }
        return that.collection.findOneAndUpdate(myQuery, { $set: valuesToUpdate }, { returnOriginal: false });
    }

    deletePlaylist(playlistID, filters) {
        const that = this;
        if (!ObjectID.isValid(playlistID)) {
            return Promise.reject(new Error("INVALID_LIST_ID_FORMAT"));
        }
        var myQuery = { _id: new ObjectID(playlistID) };
        Object.assign(myQuery, filters);
        return that.collection.deleteOne(myQuery);
    }

    getPlaylists(ofUserID) {
        const that = this;
        const query = { userID: ofUserID };
        return that.collection.find(query).toArray();
    }

    checkPlaylist(playlistID, userID) {
        const that = this;
        if (!ObjectID.isValid(playlistID)) {
            return Promise.reject(new Error("INVALID_PLAYLIST_ID_FORMAT"));
        }
        var myQuery = { _id: new ObjectID(playlistID), userID: userID };
        return that.collection.findOne(myQuery);
    }
}

module.exports = Playlist;
