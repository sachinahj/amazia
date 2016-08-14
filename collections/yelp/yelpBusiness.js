'use strict'

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpBusiness extends Yelp {

  constructor(yelpBusiness) {
    super();

    for (let key in yelpBusiness) {
      this[key] = yelpBusiness[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      this.idOriginal,
      {
        idOriginal: this.idOriginal
      },
      callback
    );
  }

  static getDBModel(db) {
    const yelpBusinessDBModel = db.define("yelpBusiness", {
      id: {type: 'serial', key: true},
      cityId: {type: "number"},
      idOriginal: {type: "text"},
      name: {type: "text"},
      rating: {type: "number"},
      reviewCount: {type: "number"},
      price: {type: "number"},
      locationCity: {type: "text"},
      locationState: {type: "text"},
      locationCountry: {type: "text"},
      locationZipCode: {type: "text"},
      coordinatesLatitude: {type: "text"},
      coordinatesLongitude: {type: "text"},
    }, {
      timestamp: true,
    });

    return yelpBusinessDBModel;
  }

  static recreateDBTable(callback) {
    DB.recreateDBTable(this, callback);
  }
}

YelpBusiness.className = 'YelpBusiness';
YelpBusiness.displayProperty = 'idOriginal';

module.exports = YelpBusiness;

