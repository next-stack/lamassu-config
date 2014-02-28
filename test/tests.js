'use strict';

var test = require('tap').test
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';

test('Load config', function(t){
  var config = new LamassuConfig(con);
  config.load(function(err, result) {
    t.equal(err, null, 'There should be no error.');
    t.ok(result.ok, 'Result should be ok.');
    t.notEqual(result.config, null, 'Config should  have been read.');
    t.notEqual(result.config.exchanges, null, 'Exchanges config should be included.');
    t.notEqual(result.config.exchanges.settings, null, 'Exchanges should have settings.');
    t.notEqual(result.config.exchanges.plugins, null, 'Exchanges should have plugins.');
    t.notEqual(result.config.exchanges.plugins.settings, null, 'Exchanges plugins should have settings.');
    t.end();
  });
});
