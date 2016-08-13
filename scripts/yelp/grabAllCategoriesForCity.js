'use strict'

const Clone = require('clone');
const Rx = require('rx');

const LocalConfig = require('../../_config.json');
const BussinessSearch = require('./businessSearch');
const {
  Yelp,
  YelpAPI,
  YelpBusiness,
  YelpBusinessCategory,
  YelpLogBusinessSearch,
  YelpCategory,
} = require('../../collections/yelp');

const _getInitialParams = (city, filteredCategoryIndex) => {
  const filteredCategories = city.getFilteredYelpCategories();

  if (filteredCategoryIndex <= filteredCategories.length - 1) {

    return {
      location: `${city.name},${city.state}`,
      sort_by: 'rating',
      limit: 20,
      offset: 0,
      categories: filteredCategories[filteredCategoryIndex].alias,
    };

  } else {

    return null;

  }
}

const _getIntialInfo = (city, yelpLogBusinessSearch) => {

  const info = {
    index: 0,
    city,
  };


  if (yelpLogBusinessSearch) {

    let startingIndex = -1;
    const filteredCategories = city.getFilteredYelpCategories();

    filteredCategories.forEach((category, index) => {
      if (category.alias == yelpLogBusinessSearch.alias) {
        startingIndex = index;
      }
    });

    if (startingIndex == -1) {

      return null;

    } else {
      info.index = startingIndex;
      info.params = _getInitialParams(city, info.index);

      info.params.limit = yelpLogBusinessSearch.limit || info.params.limit;
      info.params.offset = yelpLogBusinessSearch.offset || info.params.offset;

      if (yelpLogBusinessSearch.isDone) {
        params.offset += params.limit;
      } else {
        info.yelpLogBusinessSearch = yelpLogBusinessSearch;
      }

    }

  } else {

    info.params = _getInitialParams(city, info.index);

  }

  return info;
}


const GrabAllCategoriesForCity = (city, yelpLogBusinessSearch, callback) => {
  const subject = new Rx.Subject();

  subject.subscribe(
  (info) => {
    info = Clone(info);
    console.log("info", info);

    if (info.params) {

      BussinessSearch(
        info,
        (err) => {
          if (err) return callback && callback(err, null);
          console.log(info.params.categories.alias, "done!", info);

          info.index += 1;
          info.yelpLogBusinessSearch = undefined;
          info.params = _getInitialParams(city, info.index);

          subject.onNext(info);
        }
      );

    } else {

      subject.onCompleted();

    }
  },
  (err) => {
    console.log("err", err);
  },
  () => {
    console.log("done");
    return callback && callback();
  });

  const initialInfo = _getIntialInfo(city, yelpLogBusinessSearch);

  if (initialInfo) {
    subject.onNext(initialInfo);
  } else {
    return callback && callback(`bad initialInfo: ${yelpLogBusinessSearch.alias} and ${city.name}`, null);
  }

}



module.exports = GrabAllCategoriesForCity;
