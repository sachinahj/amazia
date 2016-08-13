'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Logger = require('../logger');
const Yelp = require('./yelp');

const _logger = new Logger("YelpAPI Collection");

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
      if (err) _logger.error("_requestCallback error", err);
      if (err) return callback && callback(err, null);

      _logger.info("got response....");
      _logger.info("statusCode", response.statusCode);
      _logger.info("statusMessage", response.statusMessage);

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
          _logger.log("Making retry request....");
          Request(requestOptions, this._requestCallback(requestOptions, callback));
        }, 5000);

      }
    }
  }

  static businessSearch(queryParams, callback) {
    const requestOptions = this._getRequestOptions('businesses/search', queryParams);
    _logger.info("Making request....");
    Request(requestOptions, this._requestCallback(requestOptions, callback));
  }

}

YelpAPI.className = 'YelpAPI';

module.exports = YelpAPI;

