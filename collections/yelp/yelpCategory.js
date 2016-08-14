'use strict'

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
      this.alias,
      {
        alias: this.alias
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
    DB.recreateDBTable(this, callback);
  }
}

YelpCategory.className = 'YelpCategory';
YelpCategory.displayProperty = 'alias';

module.exports = YelpCategory;
