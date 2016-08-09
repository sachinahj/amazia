'use strict'

const City = require('./collections/city');
const DB = require('./collections/db');
const {Yelp, YelpBusiness, YelpBusinessCategory, YelpCategory} = require('./collections/yelp');

const run = () => {


  City.findLastUpdatedYelpBusiness(function (err, city) {
    if (err) console.log("server | City.findLastUpdatedYelpBusiness", err);
    console.log("city", city);

    YelpBusiness.businessSearchForCity(
    city,
    {
      location: `${city.name},${city.state}`,
      sort_by: 'rating',
      offset: 0,
      limit: 50,
    });
  });
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

