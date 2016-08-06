'use strict'

const City = require('./collections/city');
const DB = require('./collections/db');
const {Yelp, YelpBusiness, YelpBusinessCategory, YelpCategory} = require('./collections/yelp');

const run = () => {


  City.findLastUpdatedYelpBusiness().then(city => {
    console.log("city", city);

    YelpBusiness.businessSearchForCity(city, 'rating', 0).then(() => {
      console.log("done done done done");
    }).catch(err => console.log("wtf inside error", err));;
  }).catch(err => console.log("wtf outside error", err));
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

