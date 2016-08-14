'use strict'

const Orm = require('orm');

const DB = require('./db.js');

const {CategoryList} = require('./yelp');


class City {

  constructor(city) {
    for (let key in city) {
      this[key] = city[key]
    }
  }

  upsert(callback) {
    DB.upsert(
      this,
      (this.id || (this.name && this.state && this.country)),
      {
        or: [{
          id: this.id
        }, {
          and: [{
            name: this.name
          }, {
            state: this.state
          }, {
            country: this.country
          }]
        }]
      },
      callback
    );
  }

  getFilteredYelpCategories() {
    const filteredCategories = CategoryList.filter(category => {
      let toKeep = false;
      if (!category.country_whitelist || category.country_whitelist.indexOf(this.country) > -1) {
        toKeep = true;
      }

      if (category.country_blacklist && category.country_blacklist.indexOf(this.country) > -1) {
        toKeep = false;
      }

      return toKeep;
    });

    return filteredCategories;
  }

  static getDBModel(db) {
    const cityDBModel = db.define("city", {
      id: {type: 'serial', key: true},
      name: {type: "text"},
      state: {type: "text"},
      country: {type: "text"},
      forceYelpBusinessSearch: {type: "boolean"},
    }, {
      timestamp: true,
    });

    return cityDBModel;
  }

  static recreateDBTable(callback) {
    DB.recreateDBTable(this, callback);
  }

  static needsForcedYelpBusinessSearch(callback) {
    DB.getConnection((err, db) => {
      if (err) return callback && callback(err, null);

      const cityDBModel = this.getDBModel(db);

      cityDBModel.find({forceYelpBusinessSearch: true}, (err, cities) => {
        if (err) return callback && callback(err, null);

        let city = cities[0] || null;
        if (city) {
          city = new City(city);
        }

        return callback && callback(null, city);
      });
    });
  }

  static getWithId(id, callback) {
    DB.getConnection((err, db) => {
      if (err) return callback && callback(err, null);

      const cityDBModel = this.getDBModel(db);

      cityDBModel.find({id: id}, (err, cities) => {
        if (err) return callback && callback(err, null);

        let city = cities[0] || null;
        if (city) {
          city = new City(city);
        }

        return callback && callback(null, city);
      });
    });
  }
}

City.className = 'City';
City.displayProperty = 'name';

module.exports = City;
