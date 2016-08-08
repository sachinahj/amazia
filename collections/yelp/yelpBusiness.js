'use strict'

const Clone = require('clone');
const Request = require('request');
const Rx = require('rx');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');
const YelpCategory = require('./yelpCategory');
const YelpBusinessCategory = require('./yelpBusinessCategory');

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
      (this.id || this.yelpIdOriginal),
      {
        or: [{
          id: this.id
        }, {
          yelpIdOriginal: this.yelpIdOriginal
        }]
      },
      callback
    );
  }

  static businessSearchForCity (city, params, callback) {
    console.log("businessSearchForCity", params);
    const businessSubject = new Rx.Subject();
    const categorySubject = new Rx.Subject();
    const businessCategorySubject = new Rx.Subject();

    super.fetchBusinessSearch(params, function (err, json) {
      if (err) callback && callback(err, null);
      console.log("json.businesses.length", json.businesses.length);

      // json.businesses = [json.businesses[2]];

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

        const business = new YelpBusiness(businessData);

        const businessInfo = {
          business,
          businessRaw,
        }

        businessSubject.onNext(businessInfo);
      });

      businessSubject.onCompleted();


      // originalPromise.then(() => {
      //   console.log("offset", offset);
      //   if (999 > offset + 20) {
      //     return this.businessSearchForCity(city, sortBy, offset + 20);
      //   } else {
      //     console.log("resolving");
      //     return resolve();
      //   }
      // }).catch(reject);

    });

    businessSubject.subscribe(
      (businessInfo) => {
        businessInfo = Clone(businessInfo);
        businessInfo.business.upsert(() => {
          businessInfo.businessRaw.categories.forEach(categoryRaw => {
            const categoryData = {
              alias: categoryRaw.alias,
              title: categoryRaw.title,
            };
            const category = new YelpCategory(categoryData);
            businessInfo.category = category;
            categorySubject.onNext(businessInfo);
          });
        });
      },
      (err) => {
        console.log("businessSubject err");
      },
      () => {
        console.log("businessSubject completed");
      }
    );

    categorySubject.subscribe(
      (businessInfo) => {
        businessInfo = Clone(businessInfo);
        businessInfo.category.upsert(() => {
          const businessCategoryData = {
            businessId: businessInfo.business.id,
            categoryId: businessInfo.category.id,
          }
          const businessCategory = new YelpBusinessCategory(businessCategoryData);
          businessInfo.businessCategory = businessCategory;
          businessCategorySubject.onNext(businessInfo);
        });
      },
      (err) => {
        console.log("categorySubject err");
      },
      () => {
        console.log("categorySubject completed");
      }
    );

    businessCategorySubject.subscribe(
        (businessInfo) => {
          businessInfo.businessCategory.upsert(() => {});
        },
        (err) => {
          console.log("businessCategorySubject err");
        },
        () => {
          console.log("businessCategorySubject completed");
        }
    );
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

  static recreateDBTable(callback) {
    DB.getConnection((err, db) => {
      const yelpBusinessDBModel = this.getDBModel(db);

      yelpBusinessDBModel.drop(err => {
        if (err) return callback && callback(err, null);

        yelpBusinessDBModel.sync(err => {
          if (err) return callback && callback(err, null);

          console.log("YelpBusiness | done creating YelpBusiness table!");
          return callback && callback(null);
        });
      });
    });
  }
}

YelpBusiness.className = 'YelpBusiness';
YelpBusiness.displayProperty = 'yelpIdOriginal';

module.exports = YelpBusiness;

