'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');
var _ = require('lodash');
var pg = require('pg');
var fs = require('fs');

function deriveKey(pwd, salt, callback) {
  var salt_ = salt || crypto.randomBytes(20).toString('base64');

  crypto.pbkdf2(pwd, salt_, 500000, 20, function(err, derivedKey) {
    if (err) return callback(err);
    callback(null, salt_, derivedKey.toString('base64'));
  });
}

function fetchDbConnectionString() {
  var psqlUrl = process.env.DATABASE_URL;

  if (psqlUrl) return psqlUrl;

  var psqlUrlPath = '/etc/lamassu.json';

  try {
    psqlUrl = JSON.parse(fs.readFileSync(psqlUrlPath)).postgresql;
  } catch (ex) {
    throw new Error('Can\'t parse db url file %s: %s', psqlUrlPath, ex);
  }

  return psqlUrl;
}

var LamassuConfig = module.exports = function (conString, pairingTokenTTL) {
  conString = conString || fetchDbConnectionString();
  if (!conString) {
    throw new Error('Postgres connection string is required');
  }

  this.pairingTokenTTL = pairingTokenTTL || 60 * 60; // One hour.
  this.client = new pg.Client(conString);
  this.client.connect();

  this._startListening();

  EventEmitter.call(this);
};
util.inherits(LamassuConfig, EventEmitter);

LamassuConfig.prototype._readConfig = function(configType, callback) {
  var self = this;
  var sql = 'SELECT data FROM user_config';
  var sqlParams = [];
  if(configType)  {
    sql += ' WHERE type = $1';
    sqlParams.push(configType);
  }
  sql+= ' ORDER BY id';

  self.client.query({text: sql, values:sqlParams}, function(err, results){
    if (err) { return callback(err); }

    var config = {};
    if (!results || results.rowCount === 0) {
      return callback(new Error('No rows found in configuration table.'));
    }
    for(var i = 0; i < results.rows.length; i++) {
      _.merge(config, results.rows[i].data);
    }

    callback(null, config);
  });
};

LamassuConfig.prototype.mergeConfig = function(config, callback) {
  var self = this;

  if (!config.exchanges)
    return callback(new Error('Configuration root key must be \'exchanges\''));

  this.readExchangesConfig(function (err, res) {
    if (err) return callback(err);
    _.merge(res, config);
    self.saveExchangesConfig(res, function (err) {
      if (err) return callback(err);
      self.end();
      callback(null);
    });
  });
};

LamassuConfig.prototype._updateConfig = function(configType, config, callback) {
  var self = this;

  self.client.query('BEGIN');
  self.client.query({
    text: 'UPDATE user_config SET data = $1 WHERE type = $2',
    values: [config, configType]
  });
  self.client.query('NOTIFY "config_update"');
  self.client.query('COMMIT', function (err) {
    if (err) {
      return callback(err, { ok:false, msg: 'Failed to save config.' });
    }
    callback(null, { ok:true });
  });
};

LamassuConfig.prototype._startListening = function () {
  var self = this;

  self.client.query('LISTEN "config_update"');

  self.client.on('notification', function (notification) {
    if (notification.channel === 'config_update') {
      self.emit('configUpdate');
    }
  });
};

LamassuConfig.prototype.load = function(callback) {
  this._readConfig(undefined, function(err, config) {
    if(err) { return callback(err); }

    config.exchanges.settings.currency = config.brain.locale.currency;
    config.exchanges.settings.networkTimeout = config.brain.networkTimeout;

    callback(null, config);
  });
};



LamassuConfig.prototype.readExchangesConfig = function(callback) {
  this._readConfig('exchanges', callback);
};



LamassuConfig.prototype.saveExchangesConfig = function(config, callback) {
  this._updateConfig('exchanges', {exchanges: config.exchanges}, callback);
};

LamassuConfig.prototype.end = function () {
  this.client.end();
};

LamassuConfig.prototype.isAuthorized = function(fingerprint, callback) {
  this.client.query({
    text: 'SELECT * FROM devices WHERE fingerprint = $1 AND authorized=true',
    values: [fingerprint]
  }, function(err, results) {
    if (err) return callback(err);
    callback(null, results.rows.length === 1 ? results.rows[0] : null);
  });
};

LamassuConfig.prototype.createPairingToken = function(callback) {
  var token = crypto.randomBytes(32).toString('hex');
  this.client.query({
    text: 'INSERT INTO pairing_tokens VALUES (DEFAULT, $1, DEFAULT)',
    values: [token]
  }, function(err) {
    if (err) return callback(err);
    callback(null, token);
  });
};

LamassuConfig.prototype.pair = function(token, fingerprint, name, callback) {
  var self = this;

  self.client.query({
    text: 'DELETE FROM pairing_tokens WHERE token=$1 AND created > (now() - $2 * INTERVAL \'1 second\')',
    values: [token, this.pairingTokenTTL]
  }, function(err, results) {
    if (err) return callback(err);

    if (results.rowCount === 1) {
      token = results.rows[0];

      // TODO When we implement manual pairing, this should be set to false
      self.client.query({
        text: 'INSERT INTO devices VALUES (DEFAULT, $1, $2, true)',
        values: [fingerprint, name]
      }, function (err) {
        if (err && err.code === '23505') {
          return callback(new Error('Device with this fingerprint already exists'));
        }
        callback(err);
      });
    }
    else {
      return callback(new Error('Token expired or not found'));
    }
  });
};

LamassuConfig.prototype.devices = function (callback) {
  this.client.query({
    text: 'SELECT fingerprint, name FROM devices'
  }, function (err, results) {
    if (err) return callback(err);
    callback(null, results.rows);
  });
};

LamassuConfig.prototype.unpairAll = function (callback) {
  this.client.query({
    text: 'DELETE FROM devices'
  }, function (err, results) {
    callback(err, results.rowCount);
  });
};

LamassuConfig.prototype.unpair = function (fingerprint, callback) {
  this.client.query({
    text: 'DELETE FROM devices WHERE fingerprint = $1',
    values: [fingerprint]
  }, function (err, results) {
    callback(err, results.rowCount === 1);
  });
};

LamassuConfig.prototype.authorize = function(fingerprint, callback) {
  this.client.query({
    text: 'UPDATE devices SET authorized=true WHERE fingerprint=$1',
    values: [fingerprint]
  }, callback);
};

LamassuConfig.prototype.addUser = function(user, pwd, callback) {
  var self = this;

  deriveKey(pwd, null, function(err, salt, derivedKey) {
    if (err) return callback(err);

    self.client.query({
      text: 'INSERT INTO "users" VALUES (DEFAULT, $1, $2, $3)',
      values: [user, salt, derivedKey]
    }, callback);
  });
};

LamassuConfig.prototype.updatePassword = function(userName, pwd, callback) {
  var self = this;

  deriveKey(pwd, null, function(err, salt, derivedKey) {
    if (err) return callback(err);

    self.client.query({
      text: 'UPDATE users SET pwdHash=$1, salt=$2 WHERE userName=$3',
      values: [derivedKey, salt, userName]
    }, callback);
  });
};

LamassuConfig.prototype.users = function (callback) {
  this.client.query({
    text: 'SELECT username FROM users'
  }, function (err, results) {
    if (err) return callback(err);
    callback(null, results.rows);
  });
};

LamassuConfig.prototype.userDelAll = function (callback) {
  this.client.query({
    text: 'DELETE FROM users'
  }, function (err, results) {
    callback(err, results.rowCount);
  });
};

LamassuConfig.prototype.userDel = function (username, callback) {
  this.client.query({
    text: 'DELETE FROM users WHERE username = $1',
    values: [username]
  }, function (err, results) {
    callback(err, results.rowCount === 1);
  });
};


LamassuConfig.prototype.authenticateUser = function(user, pwd, callback) {
  this.client.query({
    text: 'SELECT * FROM "users" WHERE "username"=$1',
    values: [user]
  }, function(err, results) {
    if (err) return callback(err);

    if (results.rowCount === 0) return callback(null, null);

    var obj = results.rows.shift();

    deriveKey(pwd, obj.salt, function(_err, salt, derivedKey) {
      if (_err) return callback(_err);

      if (obj.pwdhash === derivedKey)
        return callback(null, obj);

      callback(null, null);
    });
  });
};

LamassuConfig.prototype.cleanExpiredPairingTokens = function(callback) {
  this.client.query({
    text: 'DELETE FROM pairing_tokens WHERE created < (now() - $1 * INTERVAL \'1 second\')',
    values: [this.pairingTokenTTL]
  }, callback);
};
