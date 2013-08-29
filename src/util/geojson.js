/* global Base64, L */

'use strict';

var util = require('./util');

module.exports = {
  /**
   * Converts an NPMap.js GeoJSON layer config object to a Leaflet GeoJSON layer config object.
   * @param {Object} config
   * @return {Object} config
   */
  _toLeaflet: function(config) {
    // TODO: Setup "shortcuts" for pre-defined styles, taken from Mamata's work on colors.
    config.style = config.style || {};

    util.extend(config.style, {
      color: '#d9bd38',
      fill: true,
      fillColor: '#d9bd38',
      fillOpacity: 0.2,
      opacity: 0.8,
      stroke: true,
      weight: 5
    });

    if (typeof config.onEachFeature !== 'function') {
      if (config.popup) {
        config.onEachFeature = function(feature, layer) {
          layer.bindPopup(config.popup(feature.properties));
        };
      } else {
        config.onEachFeature = function(feature, layer) {
          var properties = feature.properties;

          if (typeof properties === 'object') {
            var html = '<table><tbody>';

            for (var prop in properties) {
              html += '<tr><th>' + prop + '</th><td>' + properties[prop] + '</td></tr>';
            }

            html += '</tbody></table>';
            layer.bindPopup(html);
          }
        };
      }
    }

    if (typeof config.pointToLayer !== 'function') {
      config.pointToLayer = function(feature, latlng) {
        return L.circleMarker(latlng, {
          color: '#000',
          fillColor: '#7a4810',
          fillOpacity: 0.8,
          opacity: 1,
          radius: 8,
          weight: 1
        });
      };
    }

    return config;
  }
};