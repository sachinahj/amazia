'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpAPI extends Yelp {

  constructor() {
    super();
  }

  static _getRequestOptions (apiSlug, queryParams) {
    const url = `${LocalConfig.dataProviders.yelp.baseUrl}/${apiSlug}`;

    const options = {
      method: 'GET',
      url: url,
      qs: queryParams,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${LocalConfig.dataProviders.yelp.accessToken}`
      },
    };

    return options;

  }

  static _requestCallback (callback) {
    return (err, response, body) => {
      if (err) console.error("YelpAPI _requestCallback err", err);
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
  }

  static businessSearch(queryParams, callback) {
    const requestOptions = this._getRequestOptions('businesses/search', queryParams);

    Request(requestOptions, this._requestCallback(callback));

  }

}

YelpAPI.className = 'YelpAPI';

module.exports = YelpAPI;

