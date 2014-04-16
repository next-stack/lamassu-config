'use strict';

var test = require('tap').test
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu-test';

test('Load config', function(t){
  var config = new LamassuConfig(con);
  config.load(function(err, result) {
    t.equal(err, null, 'There should be no error.');
    t.notEqual(result, null, 'Config should  have been read.');
    t.notEqual(result.exchanges, null, 'Exchanges config should be included.');
    t.notEqual(result.exchanges.settings, null, 'Exchanges should have settings.');
    t.notEqual(result.exchanges.plugins, null, 'Exchanges should have plugins.');
    t.notEqual(result.exchanges.plugins.settings, null, 'Exchanges plugins should have settings.');
    t.end();

    config.end();
  });
});
