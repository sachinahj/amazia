'use strict'

const myArgs = process.argv.slice(2);

const Logger = require('./collections/logger');
const Scripts = require('./scripts');

const _logger = new Logger("Spawn");

Scripts.Start((err) => {
  if (err) return _logger.error(err);
  process.exit();
});
