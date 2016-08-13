'use strict'

const CronJob = require('cron').CronJob;
const Moment = require('moment-timezone');
const Path = require('path');
const Spawn = require('child_process').spawn;

const DB = require('./collections/db')

const folderPath = Path.dirname(require.main.filename);

let _spawnedProcess = null;

const _spawnProcess = (league, type) => {
  const spawnedProcess = Spawn('nice', ['-n', '15', 'node', folderPath + '/spawn.js']);

  spawnedProcess.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  spawnedProcess.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  spawnedProcess.on('close', function (code) {
    console.log('spawnedProcess | Child process exited with code ' + code);
  });

  return spawnedProcess;
};


_spawnedProcess = _spawnProcess();

new CronJob("*/2 * * * *", function () {

  if (_spawnedProcess) {
    _spawnedProcess.kill();
  }

  _spawnedProcess = _spawnProcess();

}, function () {}, true, 'America/Chicago');


// DB.recreateDBTables();
