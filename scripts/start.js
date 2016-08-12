'use strict'

const CronJob = require('cron').CronJob;

const City = require('../collections/city');
const {YelpLogBusinessSearch} = require('../collections/yelp');
const Scirpts = require('./index');

const _run = () => {
  City.needsForcedYelpBusinessSearch((err, city) => {
    if (err) console.log("server | City.needsForcedYelpBusinessSearch", err);
    console.log("city", city);

    if (city) {
      city.forceYelpBusinessSearch = false;
      city.upsert(() => {
        console.log("scripting", city);
        Scirpts.Yelp.GrabAllCategoriesForCity(city);
      });
    } else {
      YelpLogBusinessSearch.findLatestLog((err, log) => {
        City.getWithId(log.cityId, (err, city) => {
          console.log("scripting", city, log);
          Scirpts.Yelp.GrabAllCategoriesForCity(city, log);
        })
      });
    }
});
}

const Start = () => {
  console.log("running");
  // _run();
  new CronJob("*/1 * * * * *", function () {
    console.log("yo");
  }, function () {}, true, 'America/Chicago');
}

module.exports = Start;
