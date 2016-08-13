'use strict'

const Clone = require('clone');
const Rx = require('rx');

const LocalConfig = require('../../_config.json');
const Categories = require('./data/categories');
const BussinessSearch = require('./businessSearch');

const _fakeAsyncFunction = (city, category, callback) => {
  console.log(category.alias, "starting");
  setTimeout(function () {
    console.log(category.alias, "done");
    callback(category.alias);
  }, 3000);
}

const GrabAllCategoriesForCity = (city, yelpLogBusinessSearch, callback) => {
  const subject = new Rx.Subject();


  const filteredCategories = Categories.filter(category => {
    let toKeep = false;
    if (!category.country_whitelist || category.country_whitelist.indexOf(city.country) > -1) {
      toKeep = true;
    }

    if (category.country_blacklist && category.country_blacklist.indexOf(city.country) > -1) {
      toKeep = false;
    }

    return toKeep;
  });

  console.log("filteredCategories.length", filteredCategories.length);

  const initialParams = {
    location: `${city.name},${city.state}`,
    sort_by: 'rating',
    limit: 20,
    offset: 0,
  };

  subject.subscribe(
  (info) => {
    console.log("info", info);

    info = Clone(info);
    info.index += 1;

    if (info.index <= filteredCategories.length - 1) {
      info.params.categories = filteredCategories[info.index].alias;

      BussinessSearch(
        info.city,
        info.params,
        info.yelpLogBusinessSearch,
        (err) => {
          if (err) return callback && callback(err, null);
          info.params = Clone(initialParams);
          info.yelpLogBusinessSearch = undefined;
          console.log(filteredCategories[info.index].alias, "done!", info);
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


  let startingIndex = -1;
  let params = Clone(initialParams);

  if (yelpLogBusinessSearch) {

    filteredCategories.forEach((category, index) => {
      if (category.alias == yelpLogBusinessSearch.alias) {
        startingIndex = index;
      }
    });

    if (startingIndex == -1) {
      yelpLogBusinessSearch = undefined;
    } else if (startingIndex == filteredCategories.length - 1 && yelpLogBusinessSearch.isDone) {
      return callback && callback();
    } else {
      startingIndex -= 1;
      params.limit = yelpLogBusinessSearch.limit || params.limit;
      params.offset = yelpLogBusinessSearch.offset || params.offset;

      if (yelpLogBusinessSearch.isDone) {
        yelpLogBusinessSearch = undefined;
        params.offset += params.limit;
      }
    }
  }

  subject.onNext({
    index: startingIndex,
    city: city,
    params: params,
    yelpLogBusinessSearch: yelpLogBusinessSearch,
  });
}



module.exports = GrabAllCategoriesForCity;
