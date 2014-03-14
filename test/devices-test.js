'use strict';

var test = require('tap').test
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu';

var authorized = 'CB:3D:78:49:03:39:BA:47:0A:33:29:3E:31:25:F7:C6:4F:74:71:D7';

test('authorize and check authorization', function(t){
  var config = new LamassuConfig(con);

  t.plan(5);

  config.isAuthorized('AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:4F:74:71:D7', function(err, authorized) {
    console.log('done1');
    t.equal(err, null, 'There should be no error.');
    t.equal(authorized, false, 'device should not be authorized');
  });

  config.authorize(authorized, 'bar', function(err) {
    console.log('done2');
    t.equal(err, null, 'There should be no error when authorizing');

    config.isAuthorized(authorized, function(err, authorized) {
      console.log('done3');
      t.equal(err, null, 'There should be no error when checking authorization');
      t.equal(authorized, true, 'device just authorized should come up as authorized');

      // config.deauthorize(authorize, function(err) {
      //   t.equal(err, null, 'There should be no error when deauthorizing');

      //   config.isAuthorized(authorized, function(err, authorized) {
      //     t.equal(err, null, 'There should be no error when checking authorization');
      //     t.equal(authorized, false, 'device just deauthorized should come up as deauthorized');
      //   });
      // });
    });
  });


  t.on('end', function () {
    config.end();
  });
});
