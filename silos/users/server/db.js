const mongo = require("mongodb");
const config = require(`${process.cwd()}/config/config`);
const MongoClient = mongo.MongoClient;
const url = `mongodb://${config.databaseConfig.database.host}:${config.databaseConfig.database.port}/${config.databaseConfig.database.name}`;
class DB {
  constructor() {
    const that = this;
    this.db = null;
  }

  connectDB() {
	  const that = this;
    return new Promise((resolve, reject) => {
      MongoClient.connect(url, (err, db) => {
        if (err) {
          reject(err);
        } else {
          that.db = db;
          resolve(db);
        }
      });
    });
  }

  getDB() {
    const that = this;
    return new Promise((resolve, reject) => {
      if (this.db != null) {
        resolve(that.db);
      } else {
        reject(new Error("No database. Please use connectDB method"));
      }
    });
  }

  closeDB() {
    const that = this;
    return new Promise((resolve, reject) => {
      if (this.db != null) {
		that.db.close();
		resolve();
      } else {
        reject(new Error("No database to close. Please use connectDB method"));
      }
    });
  }
}

module.exports = DB;