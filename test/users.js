'use strict';

var test = require('tap').test;
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';


test('Auth user - create an user & auth, next try auth an user isn\'t exist', function(t) {
  t.plan(4);

  var config = new LamassuConfig(con);

  var user = 'test';
  var pwd = 'test';

  config.saveUser(user, pwd, function (err) {
    t.equal(err, null, 'There should create a new user and return no error');

    config.authenticateUser(user, pwd, function (_err, auth) {
      t.equal(_err, null, 'There should be no error.');
      t.equal(auth, true, 'There should only accept an authenticate user.');

      config.authenticateUser('bad_user', 'bad_pwd', function (err) {
        t.ok(err, 'There should auth an user isn\'t exist & return the ERROR msg: ' + err);
      });
    });
  });

  t.on('end', function () {
    config.end();
  });
});