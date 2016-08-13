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

  static _requestCallback (requestOptions, callback) {
    return (err, response, body) => {
      console.log("got response....");
      console.log("response", response.statusCode);
      console.log("response", response.statusMessage);
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
      } else {
        setTimeout(() => {
          console.log("Making retry request....");
          Request(requestOptions, this._requestCallback(requestOptions, callback));
        }, 5000);
      }
    }
  }

  static businessSearch(queryParams, callback) {
    const requestOptions = this._getRequestOptions('businesses/search', queryParams);
    console.log("Making request....");
    Request(requestOptions, this._requestCallback(requestOptions, callback));
  }

}

YelpAPI.className = 'YelpAPI';

module.exports = YelpAPI;

