'use strict'

const City = require('../collections/city');
const Logger = require('../collections/logger');
const Scripts = require('./index');
const {YelpLogBusinessSearch} = require('../collections/yelp');

const _logger = new Logger("Start");

const _whatToDo = (callback) => {
  City.needsForcedYelpBusinessSearch((err, city) => {
    if (err) return callback && callback(err, null);

    _logger.info("Forced city?", city || {});

    if (city) {

      return callback && callback(null, {
        whatToDo: "_runCityForced",
        city,
      });

    } else {

      YelpLogBusinessSearch.findLatestLog((err, yelpLogBusinessSearch) => {
        if (err) return callback && callback(err, null);

        _logger.info("findLatestLog", yelpLogBusinessSearch);

        if (yelpLogBusinessSearch) {

          City.getWithId(yelpLogBusinessSearch.cityId, (err, city) => {
            if (err) return callback && callback(err, null);

            const filteredCategories = city.getFilteredYelpCategories();
            _logger.info("last filteredCategories", filteredCategories[filteredCategories.length - 1].alias);

            if (yelpLogBusinessSearch.isDone && yelpLogBusinessSearch.alias ==  filteredCategories[filteredCategories.length - 1].alias) {

              return callback && callback(null, {
                whatToDo: "_setCityForced",
                city,
              });

            } else {

              return callback && callback(null, {
                whatToDo: "_continueFromLog",
                city,
                yelpLogBusinessSearch,
              });

            }
          });

        } else {

          return callback && callback(null, {
            whatToDo: "_setCityForced",
            city,
          });

        }
      });
    }
  });
};


const _runCityForced = (city, callback) => {
  city.forceYelpBusinessSearch = false;
  city.upsert((err) => {
    if (err) return callback && callback(err, null);
    Scripts.Yelp.GrabAllCategoriesForCity(city, undefined, callback);
  });
};

const _continueFromLog = (city, yelpLogBusinessSearch, callback) => {
  Scripts.Yelp.GrabAllCategoriesForCity(city, yelpLogBusinessSearch, callback);
};

const _setCityForced = (city, callback) => {
  YelpLogBusinessSearch.findLastUpdateCityId((err, cityId) => {

    console.log("cityId", cityId);

    return callback && callback();

    if (err) return callback && callback(err, null);

    City.getWithId(cityId, (err, city) => {
      if (err) return callback && callback(err, null);

      city.forceYelpBusinessSearch = true;
      city.upsert(callback);
    });
  });
};

const Start = (callback) => {
  _logger.info("Starting...")

  _whatToDo((err, info) => {
    if (err) return callback && callback(err, null);

    const {
      whatToDo,
      city,
      yelpLogBusinessSearch,
    } = info;


    switch (whatToDo) {
      case '_runCityForced':
        _logger.info("executing _runCityForced");
        _runCityForced(city, callback);
        break;
      case '_continueFromLog':
        _logger.info("executing _continueFromLog");
        _continueFromLog(city, yelpLogBusinessSearch, callback);
        break;
      case '_setCityForced':
        _logger.info("executing _setCityForced");
        _setCityForced(city, callback);
        break;
      default:
        return callback && callback("nothing to do", null);
    }
  });
}

module.exports = Start;
