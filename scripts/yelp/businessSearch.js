'use strict'

const Clone = require('clone');
const Rx = require('rx');

const LocalConfig = require('../../_config.json');
const {YelpAPI, YelpBusiness, YelpCategory, YelpBusinessCategory} = require('../../collections/yelp');

const BusinessesSearch = (city, params, callback) => {
  console.log("businessSearchForCity", params);
  const businessSubject = new Rx.Subject();
  const categorySubject = new Rx.Subject();
  const businessCategorySubject = new Rx.Subject();

  YelpAPI.businessSearch(params, function (err, json) {
    if (err) return callback && callback(err, null);
    console.log("json.businesses.length", json.businesses.length);

    const last = json.businesses[json.businesses.length - 1];

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
        businessInfo.isLastBusiness = true;
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
            businessInfo.isLastBusiness &&
            idx === array.length - 1
          ) {
            businessInfo.isLastCategory = true;
          }

          categorySubject.onNext(businessInfo);

          if (
            businessInfo.isLastBusiness &&
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

        if (
          businessInfo.isLastBusiness &&
          businessInfo.isLastCategory
        ) {
          businessInfo.isLastBusinessCategory = true;
        }

        businessCategorySubject.onNext(businessInfo);
      });
    }
  );

  businessCategorySubject.forEach(
    (businessInfo) => {
      businessInfo = Clone(businessInfo);

      businessInfo.businessCategory.upsert(() => {

        if (businessInfo.isLastBusinessCategory) {

          businessCategorySubject.onCompleted();

          params.offset += (params.limit || 50);
          if (999 > params.offset) {

            console.log("params", params);
            return BusinessesSearch(city, params, callback);

          } else {

            console.log("done calling back");
            return callback && callback();
          }
        }
      });
    }
  );
}

module.exports = BusinessesSearch;

