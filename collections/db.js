'use strict'

const Orm = require('orm');
const Modts = require('orm-timestamps');

const LocalConfig = require('../_config.json');

let _DBConnection = null;

class DB {

  static upsert (self, toSave, findQuery) {

    return () => {
      return new Promise((resolve, reject) => {

        DB.getConnection().then(db => {
          const DBModel = self.constructor.getDBModel(db);
          if (toSave) {
            this.save(self, findQuery)(DBModel, resolve, reject);
          } else {
            this.create(self)(DBModel, resolve, reject);
          }
        });
      });
    }
  }

  static save (self, findQuery) {

    return (DBModel, resolve, reject) => {

      DBModel.one(findQuery, (err, row) => {
        if (err) return reject(err);
        if (!row) return this.create(self)(DBModel, resolve, reject);

        for (let key in self) {
          row[key] = self[key];
        }

        row.save((err, results) => {
          if (err) return reject(err);

          for (let key in results) {
            self[key] = results[key];
          }

          console.log(self.constructor.className, "| done updating", self[self.constructor.displayProperty]);
          resolve();
        });
      });
    }
  }

  static create (self) {

    return  (DBModel, resolve, reject) => {

      DBModel.create(self, (err, results) => {
        if (err) return reject(err);

        for (let key in results) {
          self[key] = results[key];
        }

        console.log(self.constructor.className, "| done creating ", self[self.constructor.displayProperty]);
        resolve();
      });
    }
  }

  static getConnection(callback) {

    return new Promise((resolve, reject) => {

      const getURL = (whichDb = 'main') => {
        const databaseInfo = LocalConfig.database[whichDb];
        if (!databaseInfo) {
          throw `no database key for ${whichDb}`
        }

        const {
          host,
          port,
          username,
          password,
          database
        } = databaseInfo;

        const url = `mysql://${username}:${password}@${host}:${port}/${database}?pool=true`
        return url;
      };

      const url = getURL();

      if (_DBConnection) {
        return resolve(_DBConnection);
      }

      Orm.connect(url).on("connect", function (err, db) {

        if (err) {

          _DBConnection = null;
          DB.getConnection(callback);

        } else {

          db.use(Modts, {
            createdProperty: 'createdAt',
            modifiedProperty: 'modifiedAt',
            expireProperty: false,
            dbtype: { type: 'date', time: true },
            now: function() { return new Date(); },
            expire: function() { var d = new Date(); return d.setMinutes(d.getMinutes() + 60); },
            persist: true
          });

          _DBConnection = db;

          resolve(db);
        }
      });
    });
  }

  static recreateDBTables () {
    const City = require('./city');
    const {Yelp, YelpBusiness, YelpCategory, YelpBusinessCategory} = require('./yelp');

    const atlanta = new City({
      name: "Atlanta",
      state: "GA",
      country: "USA"
    });

    const miami = new City({
      name: "Miami",
      state: "FL",
      country: "USA"
    });

    City.recreateDBTable()
      .then(function () {
        return YelpBusiness.recreateDBTable();
      })
      .then(function () {
        return YelpCategory.recreateDBTable();
      })
      .then(function () {
        return YelpBusinessCategory.recreateDBTable();
      })
      .then(function () {
        return atlanta.upsert();
      })
      .then(function () {
        return miami.upsert();
      })
      .then(function () {
        console.log("done bitches");
      })
      .catch((reason) => {
        console.error("DB.recreateDBTables | reason", reason);
      });
  }
}

module.exports = DB;

