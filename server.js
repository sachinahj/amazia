'use strict'

const City = require('./collections/city.js');
const DB = require('./collections/db.js');
const {Yelp, YelpBusiness} = require('./collections/yelp.js');

const run = () => {

  DB.recreateDBTables();
  // YelpBusiness.recreateDBTable();
  // City.recreateDBTable();

  // City.findLastUpdatedYelpBusiness(city => {
  //   console.log("city", city);

  //   Yelp.getBusinesses({
  //     location: `${city.name},${city.state}`,
  //     sortBy: "rating",
  //     offset: 0,
  //   });
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

