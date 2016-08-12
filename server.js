'use strict'

const City = require('./collections/city');
const DB = require('./collections/db');
const {YelpLogBusinessSearch} = require('./collections/yelp');

const Scirpts = require('./scripts')

const run = () => {

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

run();



