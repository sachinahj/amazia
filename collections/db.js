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
        DB.save(self, findQuery, DBModel, callback);
      } else {
        DB.create(self, DBModel, callback);
      }
    });
  }

  static save (self, findQuery, DBModel, callback) {
    DBModel.one(findQuery, (err, row) => {
      if (err) return callback && callback(err, null);
      if (!row) return DB.create(self, DBModel, callback);

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

  static recreateDBTable(self, callback) {
    DB.getConnection((err, db) => {
      if (err) return callback && callback(err, null);

      const DBModel = self.getDBModel(db);

      DBModel.drop(err => {
        if (err) return callback && callback(err, null);

        DBModel.sync(err => {
          if (err) return callback && callback(err, null);

          console.log(self.className, "| done creating table!");
          return callback && callback(null);
        });
      });
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

    const async = {
      series: function (series) {
        return Rx.Observable.defer(function () {
          let acc = series[0]();
          for (let i = 1, len = series.length; i < len; i++) {
            (function (func) {
              acc = acc.flatMapLatest(function () {
                return func();
              });
            }(series[i]));
          }

          return acc;
        });
      }
    }

    const obs = async.series([
      Rx.Observable.fromNodeCallback(function (callback) {
        console.log("City.recreateDBTable");
        City.recreateDBTable(callback);
      }),
      Rx.Observable.fromNodeCallback(function (callback) {
        console.log("YelpBusiness.recreateDBTable");
        YelpBusiness.recreateDBTable(callback);
      }),
      Rx.Observable.fromNodeCallback(function (callback) {
        console.log("YelpCategory.recreateDBTable");
        YelpCategory.recreateDBTable(callback);
      }),
      Rx.Observable.fromNodeCallback(function (callback) {
        console.log("YelpBusinessCategory.recreateDBTable");
        YelpBusinessCategory.recreateDBTable(callback);
      }),
      Rx.Observable.fromNodeCallback(function (callback) {
        console.log("atlanta.upsert");
        atlanta.upsert(callback);
      }),
      Rx.Observable.fromNodeCallback(function (callback) {
        console.log("miami.upsert");
        miami.upsert(callback);
      }),
    ]);

    obs.subscribe();
  }
}

module.exports = DB;

