'use strict'

const Orm = require('orm');

const DB = require('./db.js');

class City {

  constructor(city) {
    for (var key in city) {
      this[key] = city[key]
    }
  }

  upsert() {
    DB.getConnection((err, db) => {
      if (err) throw err;
      const cityDBModel = this.constructor.getDBModel(db);
      cityDBModel.create(this, (err, results) => {
        if (err) throw err;
        console.log("results", results);
      });
    });

    function save() {

    }

    function create() {

    }
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
      if (err) throw err;
      const cityDBModel = this.getDBModel(db);
      cityDBModel.drop(err => {
        if (err) throw err;
        cityDBModel.sync(err => {
          if (err) throw err;
          console.log("done creating City table!");
          callback && callback();
        });
      });
    });
  }

  static findLastUpdatedYelpBusiness(callback) {
    DB.getConnection((err, db) => {
      if (err) throw err;
      const cityDBModel = this.getDBModel(db);

      cityDBModel.find({}).order("lastUpdatedYelpBusiness").all((err, cities) => {
        if (err) throw err;
        let city = cities[0];
        if (city) {
          city = new this(city);
        }
        callback(city);
      });
    });
  }
}

module.exports = City;
