var reqwest = require('../util/cachedreqwest')(),
tileMath = require('../util/tilemath');

module.exports = function(layer, options) {
  return {
    getTileGridPoint: function _getTileGridPoint(latLng, response) {

      // Forked from danzel/Leaflet.utfgrid
      // https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js
      var me = this,
      point = layer._map.project(latLng),
      tileSize = layer.options.tileSize || 256,
      resolution = layer.options.resolution || 4,
      x = Math.floor(point.x / tileSize),
      y = Math.floor(point.y / tileSize),
      max = layer._map.options.crs.scale(layer._map.getZoom()) / tileSize,
      returnValue;

      x = (x + max) % max;
      y = (y + max) % max;

      var gridX = Math.floor((point.x - (x * tileSize))/ resolution),
      gridY = Math.floor((point.y - (y * tileSize)) / resolution),
      key = response.grid[gridY].charCodeAt(gridX);

      // Return the data from the key
      return (response.data[response.keys[me.utfDecode(key)]]);
    },
    getTileCoords: function (latLng) {
      return {
        x: tileMath.long2tile(latLng.lng, layer._map.getZoom()),
        y: tileMath.lat2tile(latLng.lat, layer._map.getZoom()),
        z: layer._map.getZoom()
      };
    },
    getTileGrid: function (tileUrl, latLng, callback) {
      var me = this;
      request = {
        url: tileUrl,
        type: 'jsonp',
        success: function (response) {
          callback(response.response, me.getTileGridPoint(latLng, response.response));
        },
        error: function (response) {
          callback(response.response, null);
        }
      };
      if (options) {
        for (var option in options) {
          request[option] = options[option];
        }
      }
      reqwest.cachedReqwest(request);
    },
    utfDecode: function _utfDecode(key) {
      // https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js
      if (key >= 93) key--;
      if (key >= 35) key--;
      return key - 32;
    },
    hasUtfData: function(url, latLng) {
      var returnValue = {'cursor': 'default'},
      cache = reqwest.getCache(url);
      if (cache) {
        if (cache.cacheStatus === 'success' && cache.response) {
          returnValue = this.getTileGridPoint(latLng, cache.response) ? {'cursor': 'pointer'} : false;
        } else if (cache.cachdStatus === 'error') {
          returnValue = false;
        }
      }
      return returnValue;
    }
  };
};
