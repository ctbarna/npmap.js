/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GitHubLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(options) {
    L.Util.setOptions(this, this._toLeaflet(options));

    if (typeof options.data === 'object') {
      this._create(options, options.data);
    } else {
      var branch = options.branch || 'master',
        me = this;

      util.strict(options.path, 'string');
      util.strict(options.repo, 'string');
      util.strict(options.user, 'string');

      // TODO: Support CORS here for "modern" browsers.
      reqwest({
        success: function(response) {
          me._create(options, JSON.parse(util.base64.decode(response.data.content.replace(/\n|\r/g, ''))));
        },
        type: 'jsonp',
        url: 'https://api.github.com/repos/' + options.user + '/' + options.repo + '/contents/' + options.path + '?ref=' + branch
      });
    }
  },
  _create: function(options, data) {
    L.GeoJSON.prototype.initialize.call(this, data, options);
    this.fire('ready');
    return this;
  }
});

module.exports = function(options) {
  options = options || {};

  if (options.cluster) {
    return L.npmap.layer._cluster(options);
  } else {
    return new GitHubLayer(options);
  }
};
