'use strict'

const CronJob = require('cron').CronJob;
const Path = require('path');
const Spawn = require('child_process').spawn;

const DB = require('./collections/db')

const folderPath = Path.dirname(require.main.filename);

let _spawnedProcess = null;

const _spawnProcess = (league, type) => {
  const spawnedProcess = Spawn('nice', ['-n', '15', 'node', folderPath + '/spawn.js']);

  spawnedProcess.stdout.on('data', function (data) {
    console.log('spawnedProcess: stdout: ' + data);
  });

  spawnedProcess.stderr.on('data', function (data) {
    console.log('spawnedProcess: stderr: ' + data);
  });

  spawnedProcess.on('close', function (code) {
    console.log('spawnedProcess: child process exited with code ' + code);
  });

  return spawnedProcess;
};



new CronJob("*/20 * * * *", function () {

  if (_spawnedProcess) {
    _spawnedProcess.kill();
  }

  _spawnedProcess = _spawnProcess();

}, function () {}, true, 'America/Chicago');




// DB.recreateDBTables();
