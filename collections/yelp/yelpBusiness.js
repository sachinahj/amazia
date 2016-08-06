'use strict'

const Request = require('request');

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

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpBusinessDBModel = this.constructor.getDBModel(db);
        if (this.id || this.yelpIdOriginal) {
          this._save(yelpBusinessDBModel, resolve, reject);
        } else {
          this._create(yelpBusinessDBModel, resolve, reject);
        }
      });
    });
  }

  _save(yelpBusinessDBModel, resolve, reject) {

    yelpBusinessDBModel.one({
      or: [{
        id: this.id
      }, {
        yelpIdOriginal: this.yelpIdOriginal
      }]
    }, (err, yelpBusiness) => {

      if (err) return reject(err);
      if (!yelpBusiness) return this._create(yelpBusinessDBModel, resolve, reject);

      for (var key in this) {
        yelpBusiness[key] = this[key];
      }

      yelpBusiness.save((err, results) => {
        if (err) return reject(err);
        console.log("YelpBusiness | done updating business");
        resolve(results);
      });
    });
  }

  _create(yelpBusinessDBModel, resolve, reject) {

    yelpBusinessDBModel.create(this, (err, results) => {
      if (err) return reject(err);
      console.log("YelpBusiness | done creating business");
      resolve(results);
    });
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

              return originalPromise
            });
          });
        });

        originalPromise.then(() => {
          if (1000 >= offset + 20) {
            return this.businessSearchForCity(city, sortBy, offset + 20);
          } else {
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
            resolve();
          });
        });
      });
    });
  }
}


module.exports = YelpBusiness;
