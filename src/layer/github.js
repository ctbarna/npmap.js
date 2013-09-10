/* global L */

'use strict';

var util = require('../util/util');

var GitHubLayer = L.GeoJSON.extend({
  includes: [
    require('../util/geojson')
  ],
  initialize: function(config) {
    config = this._toLeaflet(config);

    if (typeof config.data === 'object') {
      L.GeoJSON.prototype.initialize.call(this, config.data, config);
      this._addAttribution();
      return this;
    } else {
      var me = this;

      util.strict(config.path, 'string');
      util.strict(config.repo, 'string');
      util.strict(config.user, 'string');
      util.request('https://api.github.com/repos/' + config.user + '/' + config.repo + '/contents/' + config.path, function(error, response) {
        L.GeoJSON.prototype.initialize.call(me, JSON.parse(util.base64.decode(response.content.replace(/\n|\r/g, ''))), config);
        me._addAttribution();
        return me;
      });
    }
  }
});

module.exports = function(config) {
  return new GitHubLayer(config);
};