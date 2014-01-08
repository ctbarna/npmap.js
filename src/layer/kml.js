/* global L */

'use strict';

var reqwest = require('reqwest'),
  togeojson = require('togeojson'),
  util = require('../util/util');

var KmlLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(config) {
    var me = this;

    config = this._toLeaflet(config);

    if (typeof config.data === 'string') {
      me._create(config, config.data);
      return this;
    } else {
      var url = config.url;

      util.strict(url, 'string');
      util.loadFile(url, 'xml', function(response) {
        if (response) {
          me._create(config, response);
        } else {
          // TODO: Display load error.
        }
      });
    }
  },
  _create: function(config, data) {
    L.GeoJSON.prototype.initialize.call(this, togeojson.kml(new DOMParser().parseFromString(data, 'text/xml')), config);
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
    return new KmlLayer(config);
  }
};
