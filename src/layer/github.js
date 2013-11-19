/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GitHubLayer = L.GeoJSON.extend({
  includes: [
    require('../include/geojson')
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
      reqwest({
        success: function(response) {
          L.GeoJSON.prototype.initialize.call(me, JSON.parse(util.base64.decode(response.data.content.replace(/\n|\r/g, ''))), config);
          me._addAttribution();
          return me;
        },
        type: 'jsonp',
        url: 'https://api.github.com/repos/' + config.user + '/' + config.repo + '/contents/' + config.path
      });
    }
  }
});

module.exports = function(config) {
  return new GitHubLayer(config);
};
