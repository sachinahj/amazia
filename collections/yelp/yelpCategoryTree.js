'use strict'

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpCategoryTree extends Yelp {

  constructor(yelpCategoryTree) {
    super();

    for (let key in yelpCategoryTree) {
      this[key] = yelpCategoryTree[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      (this.aliasLevel4 && this.aliasLevel3 && this.aliasLevel2 && this.aliasLevel1),
      {
        and: [{
          aliasLevel4: this.aliasLevel4,
        }, {
          aliasLevel3: this.aliasLevel3,
        }, {
          aliasLevel2: this.aliasLevel2,
        }, {
          aliasLevel1: this.aliasLevel3,
        }]
      },
      callback
    );
  }

  static getDBModel(db) {
    const yelpCategoryTreeDBModel = db.define("yelpCategoryTree", {
      id: {type: 'serial', key: true},
      aliasLevel4: {type: "text"},
      aliasLevel3: {type: "text"},
      aliasLevel2: {type: "text"},
      aliasLevel1: {type: "text"},
    }, {
      timestamp: true,
    });

    return yelpCategoryTreeDBModel;
  }

  static recreateDBTable(callback) {
    DB.recreateDBTable(this, callback);
  }
}

YelpCategoryTree.className = 'YelpCategoryTree';
YelpCategoryTree.displayProperty = 'aliasLevel4';

module.exports = YelpCategoryTree;
