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
        Scripts.Yelp.GrabAllCategoriesForCity(city);
      });
    } else {
      YelpLogBusinessSearch.findLatestLog((err, yelpLogBusinessSearch) => {
        if (yelpLogBusinessSearch) {
          City.getWithId(yelpLogBusinessSearch.cityId, (err, city) => {
            console.log("scripting catch up");
            console.log("city", city);
            console.log("yelpLogBusinessSearch", yelpLogBusinessSearch);
            console.log("-------------------------");
            Scripts.Yelp.GrabAllCategoriesForCity(city, yelpLogBusinessSearch);
          });
        } else {
          console.log("no city to run for");
        }
      });
    }
  });
}

module.exports = Start;
