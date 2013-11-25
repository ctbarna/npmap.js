/* global L */

'use strict';

var colorPresets = require('../preset/colors.json'),
  //iconPresets = require('../preset/icons.json'),
  topojson = require('../util/topojson'),
  util = require('../util/util');

module.exports = {
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
    if (typeof config.clickable === 'undefined' || config.clickable === true) {
      var lastTarget,
        popup;

      config.onEachFeature = function(feature, layer) {
        layer.on('click', function(e) {
          var count = 0,
            properties = feature.properties,
            target = e.target,
            html;

          if (!popup) {
            var containers = util.getChildElementsByClassName(target._map.getContainer(), 'leaflet-top');

            popup = L.popup({
              autoPanPaddingTopLeft: [
                util.getOuterDimensions(containers[0]).width + 20,
                util.getOuterDimensions(containers[1]).height + 20
              ]
            });
          }

          if (lastTarget) {
            lastTarget.closePopup().unbindPopup();
            lastTarget = null;
          }

          html = util.dataToHtml(config, properties);

          if (html) {
            if (feature.geometry.type === 'Point') {
              target.bindPopup(popup).openPopup();
              lastTarget = target;
            } else {
              popup.setContent(html).setLatLng(e.latlng.wrap()).openOn(target._map);
            }

            popup.setContent(html);

          }
        });
      };
    }

    if (typeof config.pointToLayer !== 'function') {
      config.pointToLayer = function(feature, latLng) {
        return L.marker(latLng);
      };
    }

    if (typeof config.style === 'string') {
      var color = colorPresets[config.style];

      config.style = function() {
        return color;
      };
    }

    return config;
  },
  /**
   * Override L.GeoJSON.addData to add support for TopoJSON data.
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
  }
};
