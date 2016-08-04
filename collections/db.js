'use strict'

const Orm = require("orm");
const modts = require('orm-timestamps');

const LocalConfig = require('../_config.json');

class DB {

  static getConnection(callback) {

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

      const url = `mysql://${username}:${password}@${host}:${port}/${database}?pool=true`
      return url;
    };

    const url = getURL();
    const db = Orm.connect(url);
    db.on("connect", function (err, db) {

      if (err) {
        console.error("DB.getConnection error", err);
        db.off("connect");
        db = Orm.connect(url);
        DB.getConnection(callback);

      } else {

        db.use(modts, {
          createdProperty: 'createdAt',
          modifiedProperty: 'modifiedAt',
          expireProperty: false,
          dbtype: { type: 'date', time: true },
          now: function() { return new Date(); },
          expire: function() { var d = new Date(); return d.setMinutes(d.getMinutes() + 60); },
          persist: true
        });

        callback(err, db);
      }
    });
  }
}

module.exports = DB;

