'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');


class Yelp {

  constructor() {}

  static fetchBusinessSearch(params, callback) {

    const apiSlug = 'businesses/search'
    const url = `${LocalConfig.dataProviders.yelp.baseUrl}/${apiSlug}`;

    const options = {
      method: 'GET',
      url: url,
      qs: params,
      headers: {
        'Authorization': `Bearer ${LocalConfig.dataProviders.yelp.accessToken}`
      }
    };

    const requestCallback = (err, response, body) => {
      if (err) return callback && callback(err, null);

      if (response.statusCode == 200) {
        let json;

        try {
          json = JSON.parse(body);
        } catch (err) {
          json = {
            businesses: []
          };
        }
        return callback && callback(null, json);
      }
    }

    Request(options, requestCallback);

  }
}

module.exports = Yelp;
