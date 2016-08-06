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
    return DB.upsert(this, self => {
      return self.id || (self.yelpBusinessId && self.yelpCategoryId);
    })();
  }

  static _save(self, yelpBusinessCategoryDBModel, resolve, reject) {
    return DB.save(self, {
      or: [{
        id: self.id
      }, {
        and: [{
          yelpBusinessId: self.yelpBusinessId
        }, {
          yelpCategoryId: self.yelpCategoryId
        }]
      }]
    })(yelpBusinessCategoryDBModel, resolve, reject);
  }

  static _create(self, yelpBusinessCategoryDBModel, resolve, reject) {
    return DB.create(self)(yelpBusinessCategoryDBModel, resolve, reject);
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

YelpBusinessCategory.className = 'YelpBusinessCategory';

module.exports = YelpBusinessCategory;
