/* global Base64, L */

'use strict';

module.exports = {
  /**
   * Converts an NPMap.js GeoJSON layer config object to a Leaflet GeoJSON layer config object.
   * @param {Object} config
   * @return {Object} config
   */
  _toLeaflet: function(config) {
    // TODO: How can you move this into L.GeoJSON to make it the default?
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
        return L.circleMarker(latlng);
      };
    }

    return config;
  }
};