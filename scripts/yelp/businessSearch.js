'use strict'

const _ = require('lodash');
const Clone = require('clone');
const Rx = require('rx');

const LocalConfig = require('../../_config.json');
const Logger = require('../../collections/logger');
const {
  Yelp,
  YelpAPI,
  YelpBusiness,
  YelpBusinessCategory,
  YelpLogBusinessSearch,
  YelpCategory,
} = require('../../collections/yelp');

const _logger = new Logger("Scripts Yelp BusinessesSearch");

const BusinessesSearch = (info, callback) => {
  _logger.info("Starting businessSearchForCity...", info);

  let {
    city,
    params,
    yelpLogBusinessSearch
  } = info;
  let totalBusinesses;

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

  const _upload = (uploadArray, callback) => {
    const observables = [];

    uploadArray.forEach((obj, index) => {
      const obsFn = Rx.Observable.fromNodeCallback(function (callback) {
        obj.upsert(callback)
      });
      const obs = obsFn();
      observables.push(obs);
    });

    Rx.Observable
    .from(observables)
    .concatAll()
    .toArray()
    .subscribe(results => {
      return callback && callback();
    },
    err => {
      return callback && callback(err);
    });
  }

  const _getNewParams = (params) => {
    params.offset += (params.limit || 20);
    if (999 > params.offset) {
      return params;
    }
    return null;
  };

  yelpLogBusinessSearch.upsert(err => {
    if (err) return callback && callback(err, null);

    YelpAPI.businessSearch(params, function (err, json) {
      if (err) {
        yelpLogBusinessSearch.error = err;
        return yelpLogBusinessSearch.upsert(err => {
          if (err) return callback && callback(err, null);
         return callback && callback(yelpLogBusinessSearch.error,  null);
        });
      }

      _logger.info("json.businesses.length: " + json.businesses.length);

      if (!json.businesses.length) {
        yelpLogBusinessSearch.isDone = true;
        return yelpLogBusinessSearch.upsert(err => {
          if (err) return callback && callback(err, null);
          return callback && callback();
        });
      }

      let toUpsert_businesses = [];
      let toUpsert_categories = [];
      let toUpsert_businessCategoryInfos = [];
      let toUpsert_businessCategories = [];


      json.businesses.forEach(businessRaw => {

        let price = businessRaw.price;
        price = price ? price.length : null;

        const businessData = {
          cityId: city.id,
          idOriginal: businessRaw.id,
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
        toUpsert_businesses.push(business);

        businessRaw.categories.forEach(categoryRaw => {

          const categoryData = {
            alias: categoryRaw.alias,
            title: categoryRaw.title,
          };

          const category = new YelpCategory(categoryData);
          toUpsert_categories.push(category);

          const businessCategoryInfo = {
            businessIdOriginal: businessData.idOriginal,
            categoryAlias: categoryData.alias,
          };
          toUpsert_businessCategoryInfos.push(businessCategoryInfo);
        });
      });


      toUpsert_businesses = _.uniqWith(toUpsert_businesses, _.isEqual);
      toUpsert_categories = _.uniqWith(toUpsert_categories, _.isEqual);

      _upload(toUpsert_businesses, err => {
        if (err) return callback && callback(err, null);

        _upload(toUpsert_categories, err => {
          if (err) return callback && callback(err, null);

          const idMapBusiness = {};
          const idMapCategory = {};

          toUpsert_businesses.forEach(business => {
            idMapBusiness[business.idOriginal] = business.id;
          });

          toUpsert_categories.forEach(category => {
            idMapCategory[category.alias] = category.id;
          });

          toUpsert_businessCategoryInfos.forEach(businessCategoryInfo => {
            const businessCategoryData = {
              businessId: idMapBusiness[businessCategoryInfo.businessIdOriginal],
              categoryId: idMapCategory[businessCategoryInfo.categoryAlias],
            };
            const businessCategory = new YelpBusinessCategory(businessCategoryData);
            toUpsert_businessCategories.push(businessCategory);
          });

          _upload(toUpsert_businessCategories, err => {
            if (err) return callback && callback(err, null);

            yelpLogBusinessSearch.isDone = true;
            yelpLogBusinessSearch.upsert(err => {
              if (err) return callback && callback(err, null);

              params = _getNewParams(params);

              if (!params || toUpsert_businesses.length < params.limit) {

                _logger.info(`Done with ${info.params.categories}! calling back...`);
                return callback && callback();

              } else {

                return BusinessesSearch({
                  city,
                  params,
                }, callback);
              }
            });
          });
        });
      });
    });
  });

}

module.exports = BusinessesSearch;

