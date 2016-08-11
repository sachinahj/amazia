'use strict'

const City = require('./collections/city');
const DB = require('./collections/db');

const Scirpts = require('./scripts')

const run = () => {

  City.findLastUpdatedYelpBusiness(function (err, city) {
    if (err) console.log("server | City.findLastUpdatedYelpBusiness", err);
    console.log("city", city);

    Scirpts.Yelp.GrabAllCategoriesForCity(city);
  });


  // City.findLastUpdatedYelpBusiness(function (err, city) {
  //   if (err) console.log("server | City.findLastUpdatedYelpBusiness", err);
  //   console.log("city", city);

  //   Scirpts.Yelp.BusinessSearch(
  //   city,
  //   {
  //     location: `${city.name},${city.state}`,
  //     sort_by: 'rating',
  //     offset: 0,
  //     limit: 20,
  //   });
  // });
}

// DB.recreateDBTables();
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

