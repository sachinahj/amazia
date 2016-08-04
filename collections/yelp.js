'use strict'

const Orm = require('orm');
// const QS = require('querystring');
const Request = require('request');

const DB = require('./db.js');
const LocalConfig = require('../_config.json');

const CONST_yelpBaseUrl = "https://api.yelp.com/v3";

class Yelp {
  constructor() {
    console.log("waddup Yelp");
  }

  static getBusinesses(query) {
    const apiSlug = 'businesses/search'
    const {
      location,
      sortBy,
      offset,
    } = query;

    const url = `${CONST_yelpBaseUrl}/${apiSlug}`;
    const qs = {
      location,
      sort_by: sortBy,
      offset,
    };

    const options = {
      method: 'GET',
      url: url,
      qs: qs,
      headers: {
        'Authorization': `Bearer ${LocalConfig.dataProviders.yelp.accessToken}`
      }
    };

    const callback = (err, response, body) => {
      if (err) throw err;
      if (response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log(body);

        try {
          const json = JSON.parse(body);
          json.businesses.forEach(business => console.log(business.name));
        } catch (err) {
          throw err;
        }
      }
    }

    Request(options, callback);
  }

  _authenticate() {}
}

class YelpBusiness extends Yelp {
  constructor(yelpBusiness) {
    super();
  }
}

module.exports = {
  Yelp,
  YelpBusiness,
};
