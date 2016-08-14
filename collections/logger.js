'use strict'

const Moment = require('moment-timezone');

const LocalConfig = require('../_config.json');

const _debugLevel = LocalConfig.logger.level || 'info';
const _debugLevels = ['error', 'warn', 'info'];

class Logger {

  constructor(name) {
    this.name = name || "No Name"
  }

  info (message, object) {
    this._log("info", message, object)
  }

  warn (message, object) {
    this._log("warn", message, object)
  }

  error (message, object) {
    this._log("error", message, object)
  }

  _log (level, message, object) {
    const time = Moment().tz('America/Chicago').format("YYYY-MM-DD hh:mm:ssA ZZ");

    if (_debugLevels.indexOf(level) <= _debugLevels.indexOf(_debugLevel)) {

      if (object) {
        console.log(level + ' | ' + this.name + ' | ' + time + ' | ' + message + ' --> ', object);
      } else {
        console.log(level + ' | ' + this.name + ' | ' + time + ' | ' + message);
      }
    }
  }
}


module.exports = Logger;
