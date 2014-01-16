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

exports.load = function(done) {

  _readConfig('exchanges', function(err, config) {
    if(err) return done(err);

    _config = config;

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
  var conString = "postgres://postgres:password@localhost/lamassu";
  var client = new pg.Client(conString);

  client.connect(function(err) {
    if(err) return done(err); 

    client.query('SELECT data FROM user_config ORDER BY id', function(err, results){
      var config = {};
      for(var i = 0; i < results.rows.length; i++) {
        config = deepMerge(config, JSON.parse(results.rows[i].data))
      }
      client.end();
      return done(null, config);
    });
  });
}

