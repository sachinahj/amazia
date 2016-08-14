'use strict'
const {YelpCategory} = require ('./collections/yelp');
const _ = require('lodash');

const yelpCategory = new YelpCategory({alias: 'accessories', title: 'Accessories'});
const yelpCategory2 = new YelpCategory({alias: 'accessories', title: 'Accessories'});

// yelpCategory.upsert(() => {
//   console.log("id", yelpCategory.id);
// });



const arrayObject = [{alias: 'accessories', title: 'Accessories'}, {alias: 'accessories', title: 'Accessories'}];
const arrayClass = [yelpCategory, yelpCategory2];

const uniqueArrayObject = _.uniqWith(arrayObject, _.isEqual);
const uniqueArrayClass = _.uniqWith(arrayClass, _.isEqual);


console.log("arrayObject", arrayObject);
console.log("arrayClass", arrayClass);
console.log("uniqueArrayObject", uniqueArrayObject);
console.log("uniqueArrayClass", uniqueArrayClass);
