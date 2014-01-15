'use strict';

var test = require('tap').test
var config = require('../lib/main');

test('Load config', function(t){
  config.load('test', function(err, config){
    t.equal(err, null, 'There should be no error.')
    t.notEqual(config, null, 'Config should  have been read.');
    t.notEqual(config.exchanges, null, 'Exchanges config should be included.');
    t.notEqual(config.exchanges.settings, null, 'Exchanges should have settings.');
    t.notEqual(config.exchanges.plugins, null, 'Exchanges should have plugins.');
    t.notEqual(config.exchanges.plugins.settings, null, 'Exchanges plugins should have settings.');
    t.end();
  });
});
