/* global L */

'use strict';

var topojson = require('./topojson');

module.exports = {
  /**
   * Override L.GeoJSON.addData to support TopoJSON format.
   * @param {Object} feature
   */
  addData: function(feature) {
    if (/\btopology\b/i.test(feature.type)) {
      for (var prop in feature.objects) {
        L.GeoJSON.prototype.addData.call(this, topojson.feature(feature, feature.objects[prop]));
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, feature);
    }
  },
  /**
   * Adds an attribution string for a GeoJSON "layer".
   */
  _addAttribution: function() {
    if (this.options.attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  /**
   * Removes an attribution string for a GeoJSON "layer".
   */
  _removeAttribution: function() {
    if (this.options.attribution && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(this.options.attribution);
    }
  },
  /**
   * Converts an NPMap.js GeoJSON layer config object to a Leaflet GeoJSON layer config object.
   * @param {Object} config
   * @return {Object} config
   */
  _toLeaflet: function(config) {
    // TODO: Create a GeoJSON layer
    // TODO: This isn't really working. Clicks are turned off, but mouseover still changes to pointer. GitHub issue: https://github.com/Leaflet/Leaflet/pull/1107.
    if (typeof config.clickable === 'undefined' || config.clickable === true) {
      config.onEachFeature = function(feature, layer) {
        layer.on({
          click: function(e) {
            var map = e.target._map;

            map._popup.setContent(map._popup._dataToHtml(config, e.target.feature.properties)).setLatLng(e.latlng.wrap()).openOn(map);
          }
        });
      };
    }

    if (typeof config.pointToLayer !== 'function') {
      config.pointToLayer = function(feature, latlng) {
        return L.circleMarker(latlng);
      };
    }

    return config;
  }
};
