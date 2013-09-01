/* global L */

'use strict';

var baseLayerPresets = require('../presets/baseLayers.json');
var colorPresets = require('../presets/colors.json');
var Map = L.Map.extend({
  options: {
    zoomControl: false
  },
  initialize: function(config) {
    var element = typeof config.div === 'string' ? document.getElementById(config.div) : config.div;

    console.log(config);

    L.Map.prototype.initialize.call(this, element, config);

    if (this.attributionControl) {
      this.attributionControl.setPrefix('');
    }

    return this;
  },
  /**
   * Converts an NPMap.js map config object to a Leaflet map config object.
   * @param {Object} config
   * @return {Object} config
   */
  _toLeaflet: function(config) {
    // baseLayers (presets available in baseLayerPresets)
    // center
    // layer: Differentiate between layers already created with L and layers that still need to be created with L.npmap.
    // modules
    // tools
    // zoom (done)



    // Move bootstrap.js functionality into here.
    // Still use bootstrap.js for loading indicator...







    if (L.isArray(config.layers) && config.layers.length) {
      for (var i = 0; i < config.layers.length; i++) {
        var layer = config.layers[i];

        if (typeof layer.L === 'object') {
          // This is a NPMap layer config object.
          // Create layer using L.npmap.whatever()
          // Then set config.layers[i] = newLayerObj;
        }
      }
    }
  }
});

(function() {
  // TODO: Setup "shortcuts" for pre-defined styles, taken from Mamata's work on colors.
  var style = {
    color: '#d9bd38',
    fill: true,
    fillColor: '#d9bd38',
    fillOpacity: 0.2,
    opacity: 0.8,
    stroke: true,
    weight: 3
  };

  L.CircleMarker.mergeOptions({
    color: '#000',
    fillColor: '#7a4810',
    fillOpacity: 0.8,
    opacity: 1,
    radius: 8,
    weight: 1
  });
  // TODO: Update these with default NPS icon.
  L.Marker.mergeOptions({
    icon: new L.Icon.Default(),
    opacity: 1.0
  });
  L.Path.mergeOptions(style);
  L.Polygon.mergeOptions(style);
  L.Polyline.mergeOptions(style);
  L.Popup.mergeOptions({
    autoPanPadding: L.point(48, 20), // autoPanPadding: L.bounds(L.point(45, 20), L.point(20, 20))
    offset: L.point(0, -2)
  });
})();

module.exports = function(config) {
  return new Map(config);
};