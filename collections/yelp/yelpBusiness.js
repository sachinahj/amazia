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
      if (err) console.error("fetchBusinessSearch err", err);
      if (err) return callback && callback(err, null);
      console.log("json.businesses.length", json.businesses.length);

      const last = json.businesses[json.businesses.length - 1];
      console.log("last", last);
      console.log("last.categories", last.categories);

      json.businesses.forEach((businessRaw, idx, array) => {

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

        if (idx === array.length - 1) {
          business.isLastInArray = true;
        }

        businessSubject.onNext(businessInfo);

        if (idx === array.length - 1) {
          businessSubject.onCompleted();
        }

      });
    });

    businessSubject.forEach(
      (businessInfo) => {
        businessInfo = Clone(businessInfo);
        businessInfo.business.upsert(() => {
          businessInfo.businessRaw.categories.forEach((categoryRaw, idx, array) => {
            const categoryData = {
              alias: categoryRaw.alias,
              title: categoryRaw.title,
            };

            const category = new YelpCategory(categoryData);
            businessInfo.category = category;

            if (
              businessInfo.business.isLastInArray &&
              idx === array.length - 1
            ) {
              businessInfo.category.isLastInArray = true;
            }

            categorySubject.onNext(businessInfo);

            if (
              businessInfo.business.isLastInArray &&
              idx === array.length - 1
            ) {
              categorySubject.onCompleted();
            }
          });
        });
      }
    );

    categorySubject.forEach(
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
      }
    );

    businessCategorySubject.forEach(
      (businessInfo) => {
        businessInfo.businessCategory.upsert(() => {
          if (
            businessInfo.business.isLastInArray &&
            businessInfo.category.isLastInArray
          ) {
            businessCategorySubject.onCompleted();
            businessSubject.dispose();
            categorySubject.dispose();
            businessCategorySubject.dispose();

            params.offset += (params.limit || 50);
            if (999 > params.offset) {
              console.log("params", params);
              return YelpBusiness.businessSearchForCity(city, params, callback);
            } else {
              console.log("done calling back");
              return callback && callback();
            }
          }
        });
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
    DB.recreateDBTable(this, callback);
  }
}

YelpBusiness.className = 'YelpBusiness';
YelpBusiness.displayProperty = 'yelpIdOriginal';

module.exports = YelpBusiness;

