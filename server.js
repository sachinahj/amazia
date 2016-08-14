'use strict'

const CronJob = require('cron').CronJob;
const Moment = require('moment-timezone');
const Path = require('path');
const Spawn = require('child_process').spawn;

const DB = require('./collections/db')

const folderPath = Path.dirname(require.main.filename);

let _spawnedProcess = null;
let _timer = null;

const _spawnProcess = callback => {
  const spawnedProcess = Spawn('nice', ['-n', '15', 'node', folderPath + '/spawn.js']);

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

const _infiniteRun = () => {

  if (_spawnedProcess) {
    console.log('killing spawned process...');
    _spawnedProcess.kill();
  }
  if (_timer) {
    clearTimeout(_timer);
  }

  _spawnedProcess = _spawnProcess(() => {

    _timer = setTimeout(() => {
      _infiniteRun();
    }, 10000)

  });
};


_infiniteRun();

new CronJob("0 */2 * * *", function () {

  _infiniteRun();

}, function () {}, true, 'America/Chicago');




// DB.recreateDBTables();
