'use strict';

var test = require('tap').test;
var crypto = require('crypto');
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';


function encryptPassword (pwd, cb) {
  var salt = crypto.randomBytes(128).toString('base64');
  crypto.pbkdf2(pwd, salt, 10000, 512, function (err, derivedKey) {
    cb(err, {salt: salt, key: derivedKey});
  });
}


test('Load config', function(t) {
  t.plan(6);

  var config = new LamassuConfig(con);

  var user = 'test';
  var pwd = 'test';
  
  encryptPassword(pwd, function (err, object) {
    t.equal(err, undefined, 'There should be no error.');
    t.type(object, 'object', 'res from encrypt should be an object');

    config.saveUser(user, object.salt, object.key, function (_err, res) {
      t.equal(_err, null, 'There should be no error.');
      t.equal(res.rowCount, 1, 'The INSERT op result should be 1');

      config.getUser(user, function (__err, _res) {
        t.equal(__err, null, 'There should be no error.');
        t.type(_res.rows, 'object', 'The SELELCT op result should be an object');
      });
    });
  });

  t.on('end', function () {
    setTimeout(function () {
      config.end();
    }, 1000);
  });
});