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
var _config;
var _traderConfig;

exports.load = function() {
  var softwareConfig = require('../oldconfig/software_config.json');
  var brainConfig = softwareConfig.brain;

  var userConfig = require(brainConfig.userConfigPath);
  var unitConfig = require(brainConfig.unitConfigPath);
  var deviceConfig = require(brainConfig.deviceConfigPath);

  _config = userConfig;
  _config = deepMerge(_config, softwareConfig);
  _config = deepMerge(_config, unitConfig);
  _config = deepMerge(_config, deviceConfig);

  _config.exchanges.settings.currency = _config.brain.locale.currency;

  _traderConfig = _config.exchanges;
  _traderConfig.settings.networkTimeout = _config.networkTimeout;
  return _config;
};



exports.config = function() {
  return _config;
};



exports.traderConfig = function() {
  return _traderConfig;
};

