'use strict'

const Clone = require('clone');
const Rx = require('rx');

const LocalConfig = require('../../_config.json');
const {
  Yelp,
  YelpAPI,
  YelpBusiness,
  YelpBusinessCategory,
  YelpLogBusinessSearch,
  YelpCategory,
} = require('../../collections/yelp');


const BusinessesSearch = (city, params, yelpLogBusinessSearch, callback) => {
  console.log("businessSearchForCity", params);
  const businessSubject = new Rx.Subject();
  const categorySubject = new Rx.Subject();
  const businessCategorySubject = new Rx.Subject();

  let totalRecords;
  if (!yelpLogBusinessSearch) {
    yelpLogBusinessSearch = new YelpLogBusinessSearch({
      cityId: city.id,
      alias: params.categories,
      limit: params.limit,
      offset: params.offset,
      isDone: false,
      error: null,
    });
  }

  yelpLogBusinessSearch.upsert(() => {

    YelpAPI.businessSearch(params, function (err, json) {
      if (err) {
        yelpLogBusinessSearch.error = err;
        yelpLogBusinessSearch.upsert(() => {
         return callback && callback(err,  null);
        });
      }
      console.log("json.businesses.length", json.businesses.length);
      if (!json.businesses.length) {
        yelpLogBusinessSearch.isDone = true;
        yelpLogBusinessSearch.upsert(() => {
          return callback && callback();
        });
     }

      totalRecords = json.total;

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

  const _getNewParams = (params) => {
    params.offset += (params.limit || 20);
    const maxRecords = totalRecords > 1000 ? 1000 : totalRecords;
    if (maxRecords - 1 > params.offset) {
      return params;
    }
    return null;
  };

  businessCategorySubject.forEach(
    (businessInfo) => {
      businessInfo = Clone(businessInfo);

      businessInfo.businessCategory.upsert(() => {

        if (businessInfo.isLastBusinessCategory) {
          businessCategorySubject.onCompleted();

          yelpLogBusinessSearch.isDone = true;
          yelpLogBusinessSearch.upsert(() => {

            params = _getNewParams(params);

            if (params) {

              return BusinessesSearch(city, params, undefined, callback);

            } else {

              console.log("done calling back");
              return callback && callback();
            }
          });
        }
      });
    }
  );


}

module.exports = BusinessesSearch;

