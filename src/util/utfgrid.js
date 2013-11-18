// Forked from danzel/Leaflet.utfgrid - https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js

var reqwest = require('../util/cachedreqwest')(),
    tileMath = require('../util/tilemath');

module.exports = function(layer, options) {
  return {
    getTileCoords: function(latLng) {
      var zoom = layer._map.getZoom();

      return {
        x: tileMath.long2tile(latLng.lng, zoom),
        y: tileMath.lat2tile(latLng.lat, zoom),
        z: zoom
      };
    },
    getTileGrid: function (tileUrl, latLng, callback) {
      var me = this,
          request;

      request = {
        error: function(response) {
          callback(response.response, null);
        },
        success: function(response) {
          callback(response.response, me.getTileGridPoint(latLng, response.response));
        },
        type: 'jsonp',
        url: tileUrl
      };

      if (options) {
        for (var option in options) {
          request[option] = options[option];
        }
      }

      reqwest.cachedReqwest(request);
    },
    getTileGridPoint: function(latLng, response) {
      var point = layer._map.project(latLng),
          resolution = layer.options.resolution || 4,
          tileSize = layer.options.tileSize || 256,
          max = layer._map.options.crs.scale(layer._map.getZoom()) / tileSize,
          x = Math.floor(point.x / tileSize),
          y = Math.floor(point.y / tileSize);

      x = (x + max) % max;
      y = (y + max) % max;

      return (response.data[response.keys[this.utfDecode(response.grid[Math.floor((point.y - (y * tileSize)) / resolution)].charCodeAt(Math.floor((point.x - (x * tileSize)) / resolution)))]]);
    },
    hasUtfData: function(url, latLng) {
      var cache = reqwest.getCache(url),
          returnValue = {'cursor': 'default'};

      if (cache) {
        if (cache.cacheStatus === 'success' && cache.response) {
          returnValue = this.getTileGridPoint(latLng, cache.response) ? {'cursor': 'pointer'} : false;
        } else if (cache.cacheStatus === 'error') {
          returnValue = false;
        }
      }

      return returnValue;
    },
    utfDecode: function _utfDecode(key) {
      if (key >= 93) {
        key--;
      }

      if (key >= 35) {
        key--;
      }

      return key - 32;
    }
  };
};