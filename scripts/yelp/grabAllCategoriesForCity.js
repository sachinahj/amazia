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

const GrabAllCategoriesForCity = (city, yelpLogBusinessSearch) => {
  const subject = new Rx.Subject();

  console.log("Categories.length", Categories.length);

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
  }

  let params = initialParams;

  subject.subscribe(
  (index) => {
    index += 1;
    params.categories = filteredCategories[index].alias;
    console.log("index", index);
    if (index <= filteredCategories.length - 1) {
      BussinessSearch(
        city,
        params,
        yelpLogBusinessSearch,
        () => {
          params = initialParams;
          yelpLogBusinessSearch = undefined;
          console.log(filteredCategories[index].alias, "done!");
          subject.onNext(index);
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
  });


  let startingIndex = -1;

  if (yelpLogBusinessSearch) {

    filteredCategories.forEach((category, index) => {
      if (category.alias == yelpLogBusinessSearch.alias) {
        startingIndex = index;
      }
    });

    startingIndex -=1;
    params.limit = yelpLogBusinessSearch.limit || params.limit;
    params.offset = yelpLogBusinessSearch.offset || params.offset;

    if (yelpLogBusinessSearch.isDone) {
      yelpLogBusinessSearch = undefined;
      params.offset += params.limit;
    }
  }

  console.log("startingIndex", startingIndex);

  subject.onNext(startingIndex);
}



module.exports = GrabAllCategoriesForCity;
