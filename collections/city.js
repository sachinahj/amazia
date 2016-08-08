'use strict'

const Orm = require('orm');

const DB = require('./db.js');

class City {

  constructor(city) {
    for (let key in city) {
      this[key] = city[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      (this.id || (this.name && this.state && this.country)),
      {
        or: [{
          id: this.id
        }, {
          and: [{
            name: this.name
          }, {
            state: this.state
          }, {
            country: this.country
          }]
        }]
      },
      callback
    );
  }

  static getDBModel(db) {
    const cityDBModel = db.define("city", {
      id: {type: 'serial', key: true},
      name: {type: "text"},
      state: {type: "text"},
      country: {type: "text"},
      lastUpdatedYelpBusiness: {type: "number"},
    }, {
      timestamp: true,
    });

    return cityDBModel;
  }

  static recreateDBTable(callback) {
    DB.getConnection((err, db) => {
      if (err) return callback && callback(err, null);

      const cityDBModel = this.getDBModel(db);

      cityDBModel.drop(err => {
        if (err) return callback && callback(err, null);

        cityDBModel.sync(err => {
          if (err) return callback && callback(err, null);

          console.log("City | done creating City table!");
          return callback && callback(null);
        });
      });
    });
  }

  static findLastUpdatedYelpBusiness(callback) {
    DB.getConnection((err, db) => {
      if (err) return callback && callback(err, null);

      const cityDBModel = this.getDBModel(db);

      cityDBModel.find({}).order("lastUpdatedYelpBusiness").all((err, cities) => {
        if (err) return callback && callback(err, null);

        let city = cities[0];
        if (city) {
          city = new this(city);
        }

        return callback && callback(null, city);
      });
    });
  }
}

module.exports = City;
