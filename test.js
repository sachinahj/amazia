'use strict'
const {YelpCategory} = require ('./collections/yelp');

const yelpCategory = new YelpCategory({alias: 'accessories', title: 'Accessories'});

yelpCategory.upsert(() => {
  console.log("id", yelpCategory.id);
});
