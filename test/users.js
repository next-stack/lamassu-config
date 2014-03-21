'use strict';

var test = require('tap').test;
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';


test('Load config', function(t) {
  t.plan(4);

  var config = new LamassuConfig(con);

  var user = 'test';
  var pwd = 'test';

  config.saveUser(user, pwd, function (err, res) {
    t.equal(err, null, 'There should be no error.');
    t.equal(res.rowCount, 1, 'The INSERT op should return 1');

    config.authenticateUser(user, pwd, function (_err, _res) {
      t.equal(_err, null, 'There should be no error.');
      t.equal(_res > 0, true, 'The SELECT op should return the user id');
    });
  });

  t.on('end', function () {
    setTimeout(function () {
      config.end();
    }, 1000);
  });
});