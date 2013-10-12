/* global L */

'use strict';

var mustache = require('mustache'),
    topojson = require('./topojson');

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
   *
   */
  _addAttribution: function() {
    if (this.options.attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  /**
   *
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
    // TODO: This isn't really working. Clicks are turned off, but mouseover still changes to pointer. GitHub issue: https://github.com/Leaflet/Leaflet/pull/1107.
    if (typeof config.clickable === 'undefined' || config.clickable === true) {
      if (typeof config.onEachFeature !== 'function') {
        if (config.popup) {
          if (typeof config.popup === 'string') {
            config.onEachFeature = function(feature, layer) {
              layer.bindPopup('<div class="npmap-overflow">' + mustache.render(config.popup, feature.properties) + '</div>');
            };
          } else {
            config.onEachFeature = function(feature, layer) {
              layer.bindPopup('<div class="npmap-overflow">' + config.popup(feature.properties) + '</div>');
            };
          }
        } else {
          config.onEachFeature = function(feature, layer) {
            var properties = feature.properties;

            if (typeof properties === 'object') {
              var html = '<table><tbody>';

              for (var prop in properties) {
                html += '<tr><th>' + prop + '</th><td>' + properties[prop] + '</td></tr>';
              }

              html += '</tbody></table>';
              layer.bindPopup('<div class="title">Information</div><div class="npmap-overflow">' + html + '</div>');
            }
          };
        }
      }
    }

    if (typeof config.pointToLayer !== 'function') {
      config.pointToLayer = function(feature, latlng) {
        return L.circleMarker(latlng);
      };
    }

    return config;
  }
};