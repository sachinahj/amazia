'use strict'

const City = require('../collections/city');
const {YelpLogBusinessSearch} = require('../collections/yelp');
const Scripts = require('./index');

const Start = () => {
  City.needsForcedYelpBusinessSearch((err, city) => {
    if (err) console.log("server | City.needsForcedYelpBusinessSearch", err);
    console.log("city", city);

    if (city) {
      city.forceYelpBusinessSearch = false;
      city.upsert(() => {
        console.log("scripting forced", city);
        console.log("city", city);
        console.log("-------------------------");
        Scripts.Yelp.GrabAllCategoriesForCity(city, undefined, () => {
          if (err) return console.error("GrabAllCategoriesForCity err", err);
          console.log("GrabAllCategoriesForCity done for", city.name);
        });
      });
    } else {
      YelpLogBusinessSearch.findLatestLog((err, yelpLogBusinessSearch) => {
        if (yelpLogBusinessSearch) {
          City.getWithId(yelpLogBusinessSearch.cityId, (err, city) => {
            console.log("scripting catch up");
            console.log("city", city);
            console.log("yelpLogBusinessSearch", yelpLogBusinessSearch);
            console.log("-------------------------");
            Scripts.Yelp.GrabAllCategoriesForCity(city, yelpLogBusinessSearch, () => {
              if (err) return console.error("GrabAllCategoriesForCity err", err);
              console.log("GrabAllCategoriesForCity done for", city.name);
            });
          });
        } else {
          console.log("no city to run for");
        }
      });
    }
  });
}

module.exports = Start;
