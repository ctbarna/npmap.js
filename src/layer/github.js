/* global Base64, L */

'use strict';

var topojson = require('topojson'),
    util = require('../util/util');

var GitHubLayer = L.GeoJSON.extend({
  includes: [
    require('../util/geojson')
  ],
  options: {},
  initialize: function(config) {
    config = this._toLeaflet(config);

    if (typeof config.data === 'object') {
      L.GeoJSON.prototype.initialize.call(this, config.data, config);
      return this;
    } else {
      var me = this;

      util.strict(config.path, 'string');
      util.strict(config.repo, 'string');
      util.strict(config.user, 'string');
      util.request('https://api.github.com/repos/' + config.user + '/' + config.repo + '/contents/' + config.path, function(error, response) {
        if (config.path.indexOf('topojson') !== -1) {

        }

        L.GeoJSON.prototype.initialize.call(me, JSON.parse(util.base64.decode(response.content.replace(/\n|\r/g, ''))), config);
        me.fire('ready');
        return me;
      });
    }
  }
});

module.exports = function(config) {
  return new GitHubLayer(config);
};