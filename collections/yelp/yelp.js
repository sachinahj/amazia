'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');


class Yelp {

  constructor() {}

  static fetchBusinessSearch(params, callback) {

    const apiSlug = 'businesses/search'
    const {
      location,
      sortBy,
      offset,
    } = params;

    const url = `${LocalConfig.dataProviders.yelp.baseUrl}/${apiSlug}`;
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

    const requestCallback = (err, response, body) => {
      if (err) return callback && callback(err, null);

      if (response.statusCode == 200) {
        try {
          const json = JSON.parse(body);
          console.log("here");
          return callback && callback(null, json);
        } catch (err) {
          console.log("there", err);
          return callback && callback(err, null);
        }
      }
    }

    Request(options, requestCallback);

  }
}

module.exports = Yelp;
