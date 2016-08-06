'use strict'

const Request = require('request');

const DB = require('../db');
const LocalConfig = require('../../_config.json');
const Yelp = require('./yelp');

class YelpCategory extends Yelp {

  constructor(yelpCategory) {
    super();

    for (var key in yelpCategory) {
      this[key] = yelpCategory[key]
    }
  }

  upsert() {

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpCategoryDBModel = this.constructor.getDBModel(db);
        if (this.id || this.alias) {
          this._save(yelpCategoryDBModel, resolve, reject);
        } else {
          this._create(yelpCategoryDBModel, resolve, reject);
        }
      });
    });
  }

  _save(yelpCategoryDBModel, resolve, reject) {

    yelpCategoryDBModel.one({
      or: [{
        id: this.id
      }, {
        alias: this.alias
      }]
    }, (err, yelpCategory) => {

      if (err) return reject(err);
      if (!yelpCategory) return this._create(yelpCategoryDBModel, resolve, reject);

      for (var key in this) {
        yelpCategory[key] = this[key];
      }

      yelpCategory.save((err, results) => {
        if (err) return reject(err);
        console.log("YelpCategory | done updating business");
        resolve(results);
      });
    });
  }

  _create(yelpCategoryDBModel, resolve, reject) {

    yelpCategoryDBModel.create(this, (err, results) => {
      if (err) return reject(err);
      console.log("YelpCategory | done creating business");
      resolve(results);
    });
  }

  static getDBModel(db) {
    const yelpCategoryDBModel = db.define("yelpCategory", {
      id: {type: 'serial', key: true},
      alias: {type: "text"},
      title: {type: "text"},
    }, {
      timestamp: true,
    });

    return yelpCategoryDBModel;
  }

  static recreateDBTable() {

    return new Promise((resolve, reject) => {

      DB.getConnection().then(db => {
        const yelpCategoryDBModel = this.getDBModel(db);

        yelpCategoryDBModel.drop(err => {
          if (err) return reject(err);

          yelpCategoryDBModel.sync(err => {
            if (err) return reject(err);

            console.log("YelpCategory | done creating YelpCategory table!");
            resolve();
          });
        });
      });
    });
  }
}


module.exports = YelpCategory;
