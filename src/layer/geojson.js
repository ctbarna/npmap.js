/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GeoJsonLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(options) {
    L.Util.setOptions(this, this._toLeaflet(options));

    if (typeof options.data === 'object') {
      this._create(options, options.data);
    } else {
      var me = this,
        url = options.url;

      util.strict(url, 'string');
      util.loadFile(url, 'json', function(response) {
        if (response) {
          me._create(options, response);
        } else {
          // TODO: Display load error.
        }
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
    return new GeoJsonLayer(options);
  }
};
