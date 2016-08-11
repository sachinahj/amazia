'use strict'

const Clone = require('clone');
const Rx = require('rx');

const LocalConfig = require('../../_config.json');
const Categories = require('./data/categories');

const _fakeAsyncFunction = (city, category, callback) => {
  console.log(category.alias, "starting");
  setTimeout(function () {
    console.log(category.alias, "done");
    callback(category.alias);
  }, 3000);
}

const GrabAllCategoriesForCity = (city) => {
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

  subject.subscribe(
  (index) => {
    index += 1;
    console.log("index", index);
    if (index <= filteredCategories.length - 1) {
      console.log(filteredCategories[index].alias);
      setTimeout(function () {

        subject.onNext(index);
      }, 3000);
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

  subject.onNext(-1);
}



module.exports = GrabAllCategoriesForCity;
