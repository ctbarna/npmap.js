/* global L */

'use strict';

var colorPresets = require('../preset/colors.json'),
  topojson = require('../util/topojson'),
  util = require('../util/util');

module.exports = {
  /**
   * Adds an attribution string for a GeoJSON layer.
   */
  _addAttribution: function() {
    if (this.options.attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  /**
   * Removes an attribution string for a GeoJSON layer.
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
      var lastTarget;

      config.onEachFeature = function(feature, layer) {
        layer.on('click', function(e) {
          var properties = feature.properties,
            html = util.dataToHtml(config, properties),
            target = e.target,
            popup = L.popup({
              autoPanPaddingTopLeft: util._getAutoPanPaddingTopLeft(target._map.getContainer())
            });

          if (lastTarget) {
            lastTarget.closePopup().unbindPopup();
            lastTarget = target;
          }

          if (html) {
            if (feature.geometry.type === 'Point') {
              popup.setContent(html);
              target.bindPopup(popup).openPopup();
              lastTarget = target;
            } else {
              popup.setContent(html).setLatLng(e.latlng.wrap()).openOn(target._map);
            }
          }
        });
      };
    }

    config.pointToLayer = function(feature, latLng) {
      if (config.maki) {
        var maki;

        switch (typeof config.maki) {
        case 'function':
          maki = config.maki(feature.properties);
          break;
        case 'string':
          // TODO: Support mustache templates.
          maki = config.maki;
          break;
        default:
          maki = config.maki;
        }

        config.icon = L.npmap.icon.maki(maki);
      }

      return L.marker(latLng, config);
    };

    if (typeof config.style === 'string') {
      // TODO: Check to see if it is a mustache template. If so, parse it.
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
