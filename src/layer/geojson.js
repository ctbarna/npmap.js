/* global L */

'use strict';

var GeoJsonLayer = L.GeoJSON.extend({
  options: {
    visible: true
  },
  initialize: function(config, options) {
    L.setOptions(this, options);

    if (config.geoJson) {

    } else if (config.url) {

    }
  }
});

module.exports = function(config, options) {
  return new GeoJsonLayer(config, options);
};