'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpCategory extends Yelp {

  constructor(yelpCategory) {
    super();

    for (var key in yelpCategory) {
      this[key] = yelpCategory[key]
    }
  }

  upsert() {
    return DB.upsert(this, self => {
      return self.id || self.alias;
    })();
  }

  static _save(self, yelpCategoryDBModel, resolve, reject) {
    return DB.save(self, {
      or: [{
        id: self.id
      }, {
        alias: self.alias
      }]
    })(yelpCategoryDBModel, resolve, reject);
  }

  static _create(self, yelpCategoryDBModel, resolve, reject) {
    return DB.create(self)(yelpCategoryDBModel, resolve, reject);
  }

  static getDBModel(db) {
    const yelpCategoryDBModel = db.define("yelpCategory", {
      id: {type: 'serial', key: true},
      alias: {type: "text"},
      title: {type: "text"},
    }, {
      timestamp: true,
    });

    return yelpCategoryDBModel;
  }

  static recreateDBTable() {

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpCategoryDBModel = this.getDBModel(db);

        yelpCategoryDBModel.drop(err => {
          if (err) return reject(err);

          yelpCategoryDBModel.sync(err => {
            if (err) return reject(err);

            console.log("YelpCategory | done creating YelpCategory table!");
            resolve();
          });
        });
      });
    });
  }
}

YelpCategory.className = 'YelpCategory';

module.exports = YelpCategory;
