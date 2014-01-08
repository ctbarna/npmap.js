/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GeoJsonLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(config) {
    config = this._toLeaflet(config);

    if (typeof config.data === 'object') {
      this._create(config, config.data);
    } else {
      var me = this,
        url = config.url;

      util.strict(url, 'string');
      util.loadFile(url, 'json', function(response) {
        if (response) {
          me._create(config, response);
        } else {
          // TODO: Display load error.
        }
      });
    }
  },
  _create: function(config, data) {
    L.GeoJSON.prototype.initialize.call(this, data, config);
    this._addAttribution();
    this._complete();
    return this;
  }
});

module.exports = function(config) {
  config = config || {};

  if (config.cluster) {
    return L.npmap.layer._cluster(config);
  } else {
    return new GeoJsonLayer(config);
  }
};
