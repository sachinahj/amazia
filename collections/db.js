'use strict'

const Modts = require('orm-timestamps');
const Orm = require('orm');
const Rx = require('rx');

const LocalConfig = require('../_config.json');

let _DBConnection = null;

class DB {

  static upsert (self, toSave, findQuery, callback) {
    DB.getConnection((err, db) => {
      const DBModel = self.constructor.getDBModel(db);
      if (toSave) {
        this.save(self, findQuery, DBModel, callback);
      } else {
        this.create(self, DBModel, callback);
      }
    });
  }

  static save (self, findQuery, DBModel, callback) {
    DBModel.one(findQuery, (err, row) => {
      if (err) return callback && callback(err, null);
      if (!row) return this.create(self)(DBModel, resolve, reject);

      for (let key in self) {
        row[key] = self[key];
      }

      row.save((err, results) => {
        if (err) return callback && callback(err, null);

        for (let key in results) {
          self[key] = results[key];
        }

        console.log(self.constructor.className, "| done updating", self[self.constructor.displayProperty]);
        return callback && callback(null);
      });
    });
  }

  static create (self, DBModel, callback) {
    DBModel.create(self, (err, results) => {
      if (err) return callback && callback(err, null);

      for (let key in results) {
        self[key] = results[key];
      }

      console.log(self.constructor.className, "| done creating ", self[self.constructor.displayProperty]);
      return callback && callback(null);
    });
  }

  static getConnection(callback) {

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
      return callback && callback(null, _DBConnection);
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
          expire: function() { const d = new Date(); return d.setMinutes(d.getMinutes() + 60); },
          persist: true
        });

        _DBConnection = db;

        return callback && callback(null, _DBConnection);
      }
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


    function wrapArray (items) {
      return Rx.Observable
        .from(items)
        .concatAll()
        .toArray();
    }

    Rx.Observable.from(
      [
        Rx.Observable.fromNodeCallback(City.recreateDBTable),
        Rx.Observable.fromNodeCallback(YelpBusiness.recreateDBTable),
        Rx.Observable.fromNodeCallback(YelpCategory.recreateDBTable),
        Rx.Observable.fromNodeCallback(YelpBusinessCategory.recreateDBTable),
        Rx.Observable.fromNodeCallback(atlanta.upsert),
        Rx.Observable.fromNodeCallback(miami.upsert),
      ]
    )
    .concatAll()
    .toArray()
    .forEach(
      function (results) {
        console.log('DB DB results', results);
      },
      function (err) {
        console.log('DB DB Error: %s', err);
      }
    )



    // City.recreateDBTable()
    //   .then(function () {
    //     return YelpBusiness.recreateDBTable();
    //   })
    //   .then(function () {
    //     return YelpCategory.recreateDBTable();
    //   })
    //   .then(function () {
    //     return YelpBusinessCategory.recreateDBTable();
    //   })
    //   .then(function () {
    //     return atlanta.upsert();
    //   })
    //   .then(function () {
    //     return miami.upsert();
    //   })
    //   .then(function () {
    //     console.log("done bitches");
    //   })
    //   .catch((reason) => {
    //     console.error("DB.recreateDBTables | reason", reason);
    //   });
  }
}

module.exports = DB;

