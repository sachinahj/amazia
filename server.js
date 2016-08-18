'use strict'

const CronJob = require('cron').CronJob;
const Logger = require('./collections/logger');
const Moment = require('moment-timezone');
const Path = require('path');
const Spawn = require('child_process').spawn;

const DB = require('./collections/db')

const _logger = new Logger("Server");
const _folderPath = Path.dirname(require.main.filename);

const _spawnProcess = callback => {
  const spawnedProcess = Spawn('nice', ['-n', '15', 'node', _folderPath + '/spawn.js']);

  spawnedProcess.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  spawnedProcess.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  spawnedProcess.on('close', function (code) {
    console.log('spawnedProcess | Child process exited with code ' + code);
    return callback && callback();
  });

  return spawnedProcess;
};

let _spawnedProcess = null;

const _infiniteRun = () => {

  _logger.info('spawning new _spawnProcess');
  _spawnedProcess = _spawnProcess(() => {
    _logger.info("_spawnProcess close callback");
    _spawnedProcess = null;
    _infiniteRun();
  });

};


_infiniteRun();

new CronJob("*/5 * * * *", function () {

  if (_spawnedProcess) {
    _logger.info('killing spawned process...');
    _spawnedProcess.kill();
    _spawnedProcess = null;
  }

  // _infiniteRun();

}, function () {}, true, 'America/Chicago');




// DB.recreateDBTables();
