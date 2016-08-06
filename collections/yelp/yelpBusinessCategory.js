'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpBusinessCategory extends Yelp {

  constructor(yelpBusinessCategory) {
    super();

    for (var key in yelpBusinessCategory) {
      this[key] = yelpBusinessCategory[key]
    }
  }

  upsert() {
    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpBusinessCategoryDBModel = this.constructor.getDBModel(db);
        if (this.id || (this.yelpBusinessId && this.yelpCategoryId)) {
          this._save(yelpBusinessCategoryDBModel, resolve, reject);
        } else {
          this._create(yelpBusinessCategoryDBModel, resolve, reject);
        }
      });
    });
  }

  _save(yelpBusinessCategoryDBModel, resolve, reject) {

    yelpBusinessCategoryDBModel.one({
      and: [{
        id: this.id
      }, {
        or: [{
          yelpBusinessId: this.yelpBusinessId
        }, {
          yelpCategoryId: this.yelpCategoryId
        }]
      }]
    }, (err, yelpBusinessCategory) => {
      if (err) return reject(err);
      if (!yelpBusinessCategory) return this._create(yelpBusinessCategoryDBModel, resolve, reject);

      for (var key in this) {
        yelpBusinessCategory[key] = this[key];
      }

      yelpBusinessCategory.save((err, results) => {
        if (err) return reject(err);
        console.log("YelpBusinessCategory | done updating business");
        resolve(results);
      });
    });
  }

  _create(yelpBusinessCategoryDBModel, resolve, reject) {

    yelpBusinessCategoryDBModel.create(this, (err, results) => {
      if (err) return reject(err);
      console.log("YelpBusinessCategory | done creating business");
      resolve(results);
    });
  }

  static getDBModel(db) {
    const yelpBusinessCategoryDBModel = db.define("yelpBusinessCategory", {
      id: {type: 'serial', key: true},
      yelpBusinessId: {type: "number"},
      yelpCategoryId: {type: "number"},
    }, {
      timestamp: true,
    });

    return yelpBusinessCategoryDBModel;
  }

  static recreateDBTable() {

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpBusinessCategoryDBModel = this.getDBModel(db);

        yelpBusinessCategoryDBModel.drop(err => {
          if (err) return reject(err);

          yelpBusinessCategoryDBModel.sync(err => {
            if (err) return reject(err);

            console.log("YelpBusinessCategory | done creating YelpBusinessCategory table!");
            resolve();
          });
        });
      });
    });
  }
}


module.exports = YelpBusinessCategory;
