'use strict';

var test = require('tap').test;
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';


test('Load config', function(t) {
  t.plan(3);

  var config = new LamassuConfig(con);

  var user = 'test';
  var pwd = 'test';

  config.saveUser(user, pwd, function (err) {
    t.equal(err, null, 'There should be INSERT op.');

    config.authenticateUser(user, pwd, function (_err, auth) {
      t.equal(_err, null, 'There should be no error.');
      t.equal(auth, true, 'The SELECT op should return true');
    });
  });

  t.on('end', function () {
    config.end();
  });
});