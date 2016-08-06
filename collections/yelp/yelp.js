'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');


class Yelp {

  constructor() {
    this._create
  }

  static fetchBusinessSearch(query) {

    return new Promise((resolve, reject) => {
      const apiSlug = 'businesses/search'
      const {
        location,
        sortBy,
        offset,
      } = query;

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

      const callback = (err, response, body) => {
        if (err) return reject(err);

        if (response.statusCode == 200) {
          var info = JSON.parse(body);

          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        }
      }

      Request(options, callback);
    });

  }

  _authenticate() {}
}

module.exports = Yelp;
