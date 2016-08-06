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

    return new Promise((resolve, reject) => {
      DB.getConnection().then(db => {
        const cityDBModel = this.constructor.getDBModel(db);
        if (this.id) {
        } else {
          this._create(cityDBModel, resolve, reject);
        }
      });
    });
  }

  _save(cityDBModel, resolve, reject) {

  }

  _create(cityDBModel, resolve, reject) {
    cityDBModel.create(this, (err, results) => {
      if (err) return reject(err);
      console.log("City | done creating city");
      resolve();
    });
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

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const cityDBModel = this.getDBModel(db);

        cityDBModel.drop(err => {
          if (err) return reject(err);

          cityDBModel.sync(err => {
            if (err) return reject(err);

            console.log("City | done creating City table!");
            resolve();
          });
        });
      });
    });
  }

  static findLastUpdatedYelpBusiness() {
    return new Promise((resolve, reject) => {
      DB.getConnection().then(db => {
        const cityDBModel = this.getDBModel(db);

        cityDBModel.find({}).order("lastUpdatedYelpBusiness").all((err, cities) => {
          if (err) return reject(err);

          let city = cities[0];
          if (city) {
            city = new this(city);
          }
          resolve(city);
        });
      });
    });
  }
}

module.exports = City;
