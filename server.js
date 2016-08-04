'use strict'

const City = require('./collections/city.js');
const DB = require('./collections/db.js');
const {Yelp, YelpBusiness} = require('./collections/yelp.js');

const run = () => {
  Yelp.getBusinesses({
    location: "Atlanta,GA",
    sortBy: "rating",
    offset: 0,
  });
  // City.recreateDBTable();
  // City.getAll(cities => {
  //   console.log("cities", cities);
  //   console.log("cities[0].name", cities[0].name);
  // });
}

run();



// DB.testConnection(err => {
//   if (err) {
//     console.error(err);
//     return false;
//   }

//   City.getAll(function (allCities) {
//     console.log("allCities", allCities);
//   });
// });

