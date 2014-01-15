/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var deepMerge = require('deepmerge');
var pg = require('pg'); 
var _config;
var _traderConfig;

exports.load = function(mode, done) {
  var configPath = '../oldconfig/software_config.json';
  if ('test' === mode) {
    configPath = '../testconfig/software_config.json';
  }

  var softwareConfig = require(configPath);
  var brainConfig = softwareConfig.brain;
  var unitConfig = require(brainConfig.unitConfigPath);
  var deviceConfig = require(brainConfig.deviceConfigPath);

  _readConfig('exchanges', function(err, config, configType) {
    if(err) return done(err);

    _config = config;
    _config = deepMerge(_config, softwareConfig);
    _config = deepMerge(_config, unitConfig);
    _config = deepMerge(_config, deviceConfig);

    _config.exchanges.settings.currency = _config.brain.locale.currency;

    _traderConfig = _config.exchanges;
    _traderConfig.settings.networkTimeout = _config.networkTimeout;

    return done(null, _config);
  });

};

exports.config = function() {
  return _config;
};

exports.traderConfig = function() {
  return _traderConfig;
};

function _readConfig(configType, done) {
  var conString = "postgres://postgres:89DA2w36TUx@localhost/lamassu";
  var client = new pg.Client(conString);
  var config = null;

  client.connect(function(err) {
    if(err) return done(err); 

    client.query('SELECT data FROM user_config WHERE type = \'' + configType + '\'', function processQueryResult(err, results) {
      if(err) return done(err); 

      return done(null, JSON.parse(results.rows[0].data), configType);
    });
  });
}

