'use strict';

var test = require('tap').test;
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';


test('Auth user - create an user & auth, next try auth an user isn\'t exist', function(t) {
  t.plan(8);

  var config = new LamassuConfig(con);

  var user = 'test';
  var pwd = 'test';
  var newPwd = 'hunter12';

  config.addUser(user, pwd, function (err) {
    t.equal(err, null, 'There should create a new user and return no error.');

    config.authenticateUser(user, pwd, function (err, auth) {
      t.equal(err, null, 'There should be no error.');
      t.equal(auth, true, 'There should only accept an authenticate user.');

      config.updatePassword(user, newPwd, function(err) {
        t.equal(err, null, 'There should be no error when updating password.');

        config.authenticateUser(user, newPwd, function (err, auth) {
          t.equal(err, null, 'There should be no error.');
          t.equal(auth, true, 'Newly changed password should authenticate correctly');
        });
      });
    });
  });

  config.authenticateUser('bad_user', 'bad_pwd', function (err, auth) {
    t.equal(err, null, 'There should be no error.');
    t.equal(auth, false, 'There should return false for the no auth user.');
  });

  t.on('end', function () {
    config.end();
  });
});
