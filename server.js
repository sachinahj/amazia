'use strict'

const City = require('./collections/city.js');
const DB = require('./collections/db.js');

const run = () => {
  // City.recreateDBTable();
  City.getAll(cities => {
    console.log("cities", cities);
    console.log("cities[0].name", cities[0].name);
  });
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

