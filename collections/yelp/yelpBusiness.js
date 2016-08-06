'use strict'

const Request = require('request');
var Rx = require('rx');


const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');
const YelpCategory = require('./yelpCategory');
const YelpBusinessCategory = require('./yelpBusinessCategory');

class YelpBusiness extends Yelp {

  constructor(yelpBusiness) {
    super();

    for (var key in yelpBusiness) {
      this[key] = yelpBusiness[key]
    }
  }

  upsert() {
    return DB.upsert(this, self => {
      return self.id || self.yelpIdOriginal;
    })();
  }

  static _save(self, yelpBusinessDBModel, resolve, reject) {
    return DB.save(self, {
      or: [{
        id: self.id
      }, {
        yelpIdOriginal: self.yelpIdOriginal
      }]
    })(yelpBusinessDBModel, resolve, reject);
  }

  static _create(self, yelpBusinessDBModel, resolve, reject) {
    return DB.create(self)(yelpBusinessDBModel, resolve, reject);
  }

  static businessSearchForCity (city, sortBy, offset) {
    console.log("businessSearchForCity", offset);

    return new Promise((resolve, reject) => {

      let originalPromise = Promise.resolve(true);

      super.fetchBusinessSearch({

        location: `${city.name},${city.state}`,
        sortBy: sortBy,
        offset: offset,

      }).then((json) => {
        console.log("json.businesses.length", json.businesses.length);

        json.businesses.forEach(businessRaw => {

          let price = businessRaw.price;
          price = price ? price.length : null;

          const businessData = {
            cityId: city.id,
            yelpIdOriginal: businessRaw.id,
            name: businessRaw.name,
            rating: businessRaw.rating,
            reviewCount: businessRaw.review_count,
            price: price,
            locationCity: businessRaw.location.city,
            locationState: businessRaw.location.state,
            locationCountry: businessRaw.location.country,
            locationZipCode: businessRaw.location.zip_code,
            coordinatesLatitude: businessRaw.coordinates.latitude,
            coordinatesLongitude: businessRaw.coordinates.longitude,
          };

          const business = new this(businessData);
          originalPromise = originalPromise.then(() => {
            return business.upsert().then((businessRow) => {

              let originalPromise = Promise.resolve(true);

              businessRaw.categories.forEach(categoryRaw => {

                const categoryData = {
                  alias: categoryRaw.alias,
                  title: categoryRaw.title,
                };

                const category = new YelpCategory(categoryData);
                originalPromise = originalPromise.then(() => {
                  return category.upsert().then((categoryRow) => {

                    const businessCategoryData = {
                      yelpBusinessId: businessRow.id,
                      yelpCategoryId: categoryRow.id,
                    }

                    const businessCategory = new YelpBusinessCategory(businessCategoryData);
                    return businessCategory.upsert();
                  });
                });
              });

              return originalPromise;
            });
          });
        });

        originalPromise.then(() => {
          console.log("offset", offset);
          if (999 > offset + 20) {
            return this.businessSearchForCity(city, sortBy, offset + 20);
          } else {
            console.log("resolving");
            return resolve();
          }
        }).catch(reject);

      }).catch(reject);
    });
  }

  static getDBModel(db) {
    const yelpBusinessDBModel = db.define("yelpBusiness", {
      id: {type: 'serial', key: true},
      cityId: {type: "number"},
      yelpIdOriginal: {type: "text"},
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

  static recreateDBTable() {

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpBusinessDBModel = this.getDBModel(db);

        yelpBusinessDBModel.drop(err => {
          if (err) return reject(err);

          yelpBusinessDBModel.sync(err => {
            if (err) return reject(err);

            console.log("YelpBusiness | done creating YelpBusiness table!");
            return resolve();
          });
        });
      });
    });
  }
}

YelpBusiness.className = 'YelpBusiness';

module.exports = YelpBusiness;

