'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpBusinessCategory extends Yelp {

  constructor(yelpBusinessCategory) {
    super();

    for (let key in yelpBusinessCategory) {
      this[key] = yelpBusinessCategory[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      (this.id || (this.businessId && this.categoryId)),
      {
        or: [{
          id: this.id
        }, {
          and: [{
            businessId: this.businessId
          }, {
            categoryId: this.categoryId
          }]
        }]
      },
      callback
    );
  }


  static getDBModel(db) {
    const yelpBusinessCategoryDBModel = db.define("yelpBusinessCategory", {
      id: {type: 'serial', key: true},
      businessId: {type: "number"},
      categoryId: {type: "number"},
    }, {
      timestamp: true,
    });

    return yelpBusinessCategoryDBModel;
  }

  static recreateDBTable(callback) {
    DB.recreateDBTable(this, callback);
  }
}

YelpBusinessCategory.className = 'YelpBusinessCategory';
YelpBusinessCategory.displayProperty = 'id';

module.exports = YelpBusinessCategory;
