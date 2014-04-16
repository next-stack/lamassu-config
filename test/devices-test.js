'use strict';

var test = require('tap').test
var LamassuConfig = require('../lib/main');
var con = 'psql://lamassu:lamassu@localhost/lamassu-test';

var authorized = 'CB:3D:78:49:03:39:BA:47:0A:33:29:3E:31:25:F7:C6:4F:74:71:D7';
var duplicate = 'FF:EE:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:4F:74:71:D7';

test('authorize and check authorization', function(t){
  var config = new LamassuConfig(con, 1);

  t.plan(22);

  config.isAuthorized('AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:4F:74:71:D7', function(err, authorized) {
    t.equal(err, null, 'There should be no error.');
    t.equal(authorized, null, 'device should not be authorized');
  });

  // Operator starts a pairing in the admin panel. Pairing token is created
  // and packed up into a QR code with the lamassu-server URL.
  config.createPairingToken(function(err, token) {
    t.equal(err, null, 'There should be no error when creating a pairing token');
    t.type(token, 'string', 'token should be a string');

    config.pair(token, authorized, 'bar', function(err) {
      t.equal(err, null, 'There should be no error');

      config.isAuthorized(authorized, function (err, device) {
        t.equal(err, null, 'There should be no error when checking authorization');
        t.ok(device, 'device just authorized should come up as authorized');
        t.equal(device.fingerprint, authorized);

        config.deauthorize(authorized, function(err) {
          t.equal(err, null, 'There should be no error when deauthorizing');

          config.isAuthorized(authorized, function(err, authorized) {
            t.equal(err, null, 'There should be no error when checking authorization');
            t.equal(authorized, null, 'device just deauthorized should come up as deauthorized');
          });
        });
      });
    });

    config.pair('foo', authorized, 'bar', function(err) {
      t.ok(err, 'There should be an error when pairing with invalid token');
    });
  });

  config.createPairingToken(function(err, token) {
    t.equal(err, null, 'There should be no error when creating a pairing token');

    setTimeout(function() {
      config.cleanExpiredPairingTokens(function(err) {
        t.equal(err, null, 'There should be no error when cleaning expired pairing tokens');

        config.pair(token, authorized, 'restaurant', function(err) {
          t.ok(err, 'There should be an error when trying to pair with an expired token');
          t.equal(err.message, 'Token expired or not found', 'Token should be not found');
        });
      });
    }, 2000);
  });

  // Test whether trying to pair the same device for the second time
  // causes an error.
  config.createPairingToken(function (err, token) {
    t.equal(err, null, 'There should be no error when creating a pairing token');

    config.pair(token, duplicate, 'baz', function (err) {
      t.ok(!err, 'There should be no error when pairing a duplicate device for the first time');

      config.createPairingToken(function (err, token) {
        t.equal(err, null, 'There should be no error when creating a pairing token');

        config.pair(token, duplicate, 'baz', function (err) {
          t.ok(err, 'There should be an error when pairing a duplicate device');
          t.equal(err.message, 'Device with this fingerprint already exists', 'There should be a human-readable error message');

          config.deauthorize(duplicate, function (err) {
            t.equal(err, null, 'There should be no error when deauthorizing');
          });
        });
      });
    });
  });

  t.on('end', function () {
    config.end();
  });
});
