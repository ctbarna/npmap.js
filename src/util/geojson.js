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
    // TODO: This isn't really working. Clicks are turned off, but mouseover still changes to pointer. GitHub issue: https://github.com/Leaflet/Leaflet/pull/1107.
    if (typeof config.clickable === 'undefined' || config.clickable === true) {
      if (typeof config.onEachFeature !== 'function') {
        if (config.popup) {
          config.onEachFeature = function(feature, layer) {
            layer.bindPopup('<div class="npmap-overflow">' + config.popup(feature.properties) + '</div>');
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