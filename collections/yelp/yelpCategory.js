'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpCategory extends Yelp {

  constructor(yelpCategory) {
    super();

    for (let key in yelpCategory) {
      this[key] = yelpCategory[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      (this.id || this.alias),
      {
        or: [{
          id: this.id
        }, {
          alias: this.alias
        }]
      },
      callback
    );
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

  static recreateDBTable(callback) {
    DB.getConnection((err, db) => {
      const yelpCategoryDBModel = this.getDBModel(db);

      yelpCategoryDBModel.drop(err => {
        if (err) return callback && callback(err, null);

        yelpCategoryDBModel.sync(err => {
          if (err) return callback && callback(err, null);

          console.log("YelpCategory | done creating YelpCategory table!");
          return callback && callback(null);
        });
      });
    });
  }
}

YelpCategory.className = 'YelpCategory';
YelpCategory.displayProperty = 'alias';

module.exports = YelpCategory;
