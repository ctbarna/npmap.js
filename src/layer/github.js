/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GitHubLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(config) {
    config = this._toLeaflet(config);

    if (typeof config.data === 'object') {
      this._create(config, config.data);
    } else {
      var branch = config.branch || 'master',
        me = this;

      util.strict(config.path, 'string');
      util.strict(config.repo, 'string');
      util.strict(config.user, 'string');

      // TODO: Support CORS here for "modern" browsers.
      reqwest({
        success: function(response) {
          me._create(config, JSON.parse(util.base64.decode(response.data.content.replace(/\n|\r/g, ''))));
        },
        type: 'jsonp',
        url: 'https://api.github.com/repos/' + config.user + '/' + config.repo + '/contents/' + config.path + '?ref=' + branch
      });
    }
  },
  _create: function(config, data) {
    L.GeoJSON.prototype.initialize.call(this, data, config);
    this._complete();
    return this;
  }
});

module.exports = function(config) {
  config = config || {};

  if (config.cluster) {
    return L.npmap.layer._cluster(config);
  } else {
    return new GitHubLayer(config);
  }
};
