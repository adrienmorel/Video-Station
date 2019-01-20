const ObjectID = require("mongodb").ObjectID;
const sanitize = require("mongo-sanitize");
const moment = require("moment");
const check = require("check-types");

class User {
    constructor(collection) {
        const that = this;
        that.collection = collection;
    }

    createUser(email, passwordHashed, type = "USER", state = true) {
        const that = this;
        return that.collection.insertOne({
            email: sanitize(email),
            password: passwordHashed,
            type: type,
            lastConnexion: null,
            state: state
        });
    }

    findUserById(id) {
        const that = this;
        if (!ObjectID.isValid(id)) {
            return Promise.reject(new Error("INVALID_ID_FORMAT"));
        }
        return that.collection.findOne(ObjectID(id));

    }

    findUserByEmail(email) {
        const that = this;
        if (!email) {
            return Promise.reject(new Error("INVALID_EMAIL"));
        }
        return that.collection.findOne({email: sanitize(email)});
    }

    updateLastConnexion(userID) {
        const that = this;
        if (!ObjectID.isValid(userID)) {
            return Promise.reject(new Error("INVALID_USER_ID_FORMAT"));
        }
        var myQuery = {_id: new ObjectID(userID)};
        return that.collection.findOneAndUpdate(myQuery, {$set: {lastConnexion: moment().format()}}, {returnOriginal: false});
    }

    update(userID, values) {
        const that = this;

        var valuesToUpdate = {};

        if (!ObjectID.isValid(userID)) {
            return Promise.reject(new Error("INVALID_USER_ID_FORMAT"));
        }

        if (values.state !== undefined) {
            valuesToUpdate.state = values.state;
            if (typeof values.state !== 'boolean') {
                return Promise.reject(new Error("INVALID_STATE_FORMAT"));
            }
        }

        console.log(values.type);
        if (values.type !== undefined) {
            valuesToUpdate.type = values.type;
            if (!check.string(values.type) ||
                !check.nonEmptyString(values.type) ||
                !(check.match(values.type, /^USER$/) || check.match(values.type, /^ADMIN$/))) {
                return Promise.reject(new Error("INVALID_TYPE_FORMAT"));
            }
        }

        if (values.email !== undefined) {
            valuesToUpdate.email = values.email;
            if (!check.string(values.email) ||
                !check.nonEmptyString(values.email) ||
                !check.match(values.email, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            ) {
                return Promise.reject(new Error("INVALID_EMAIL_FORMAT"));
            }
        }

        if (values.password !== undefined) {
            valuesToUpdate.password = values.password;
        }

        var myQuery = {_id: new ObjectID(userID)};
        return that.collection.findOneAndUpdate(myQuery, {$set: valuesToUpdate}, {returnOriginal: false});
    }

    getUsers() {
        const that = this;
        const query = {};
        return that.collection.find(query).toArray();
    }
}

module.exports = User;
