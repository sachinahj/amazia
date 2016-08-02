'use strict'

const Orm = require('orm');

const DB = require('./db.js');

class City {


  constructor(city) {
    this.id = city.id;
    this.name = city.name;
    this.state = city.state;
    this.country = city.country;
    this.last_updated = city.last_updated;
  }

  static getDBModel(db) {
    const cityDBModel = db.define("city", {
      name: String,
      state: String,
      country: String,
      last_updated: Number
    });

    return cityDBModel;
  }

  static recreateDBTable() {
    DB.getConnection((err, db) => {
      if (err) throw err;
      const cityDBModel = this.getDBModel(db);
      cityDBModel.drop(err => {
        if (err) throw err;
        cityDBModel.sync(err => {
          if (err) throw err;
          console.log("done creating city!")
        });
      });
    });
  }

  static getAll(callback) {
    DB.getConnection((err, db) => {
      if (err) throw err;
      const cityDBModel = this.getDBModel(db);

      cityDBModel.find({}, (err, cities) => {
        if (err) throw err;
        cities = cities.map(city => {
          const cityClassModel = new this(city);
          return cityClassModel;
        });
        callback(cities);
      });
    });
  }
}

module.exports = City;
