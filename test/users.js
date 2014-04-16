'use strict';

var test = require('tap').test;
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu-test';


test('Auth user - create an user & auth, next try auth an user isn\'t exist', function(t) {
  t.plan(9);

  var config = new LamassuConfig(con);

  var user = 'test';
  var pwd = 'test';
  var newPwd = 'hunter12';

  config.addUser(user, pwd, function (err) {
    t.equal(err, null, 'There should create a new user and return no error.');

    config.authenticateUser(user, pwd, function (err, auth) {
      t.equal(err, null, 'There should be no error.');
      t.ok(auth, 'There should only accept an authenticate user.');
      t.equal(auth.username, user, 'Username should be correct');

      config.updatePassword(user, newPwd, function(err) {
        t.equal(err, null, 'There should be no error when updating password.');

        config.authenticateUser(user, newPwd, function (err, auth) {
          t.equal(err, null, 'There should be no error.');
          t.ok(auth, 'Newly changed password should authenticate correctly');
        });
      });
    });
  });

  config.authenticateUser('bad_user', 'bad_pwd', function (err, auth) {
    t.equal(err, null, 'There should be no error.');
    t.equal(auth, null, 'it should return null for invalid authentication');
  });

  t.on('end', function () {
    config.end();
  });
});
