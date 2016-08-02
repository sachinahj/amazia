'use strict'

const DB = module.exports;

const Orm = require("orm");

const LocalConfig = require('../_config.json');

const getURL = (whichDb = 'main') => {
  const databaseInfo = LocalConfig.database[whichDb];
  if (!databaseInfo) {
    throw `no database key for ${whichDb}`
  }

  const {
    host,
    port,
    username,
    password,
    database
  } = databaseInfo;

  const url = `mysql://${username}:${password}@${host}:${port}/${database}`
  return url;
};

DB.getConnection = (callback) => {
  const url = getURL();
  const db  = Orm.connect(url);
  db.on("connect", function (err, db) {

    if (err) {

      db.off("connect");
      db  = Orm.connect(url);
      DB.getConnection(callback);

    } else {

      callback(err, db);
    }
  });
};
