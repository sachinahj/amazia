'use strict'

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpLogBusinessSearch extends Yelp {

  constructor(yelpLogBusinessSearch) {
    super();

    for (let key in yelpLogBusinessSearch) {
      this[key] = yelpLogBusinessSearch[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      this.id,
      {
        id: this.id
      },
      callback
    );
  }


  static getDBModel(db) {
    const yelpLogBusinessSearchDBModel = db.define("yelpLogBusinessSearch", {
      id: {type: 'serial', key: true},
      cityId: {type: 'number'},
      alias: {type: 'text'},
      limit: {type: 'number'},
      offset: {type: 'number'},
      isDone: {type: 'boolean'},
      error: {type: 'text'},
    }, {
      timestamp: true,
    });

    return yelpLogBusinessSearchDBModel;
  }

  static recreateDBTable(callback) {
    DB.recreateDBTable(this, callback);
  }

  static findLatestLog(callback) {
    DB.getConnection((err, db) => {
      if (err) return callback && callback(err, null);

      const yelpLogBusinessSearchDBModel = this.getDBModel(db);

      yelpLogBusinessSearchDBModel.find({}).order("isDone").order("-modifiedAt").limit(1).run((err, yelpLogsBusinessSearch) => {
        if (err) return callback && callback(err, null);

        let yelpLogBusinessSearch = yelpLogsBusinessSearch[0] || null;
        if (yelpLogBusinessSearch) {
          yelpLogBusinessSearch = new YelpLogBusinessSearch(yelpLogBusinessSearch);
        }

        return callback && callback(null, yelpLogBusinessSearch);
      });
    });
  }
}

YelpLogBusinessSearch.className = 'YelpLogBusinessSearch';
YelpLogBusinessSearch.displayProperty = 'id';

module.exports = YelpLogBusinessSearch;
