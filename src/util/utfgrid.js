var reqwest = require('../util/cachedreqwest')(),
  tileMath = require('../util/tilemath');

module.exports = {
  getTileGridPoint: function _getTileGridPoint(latLng, result, layer) {

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
    key = result.grid[gridY].charCodeAt(gridX);

    // Return the data from the key
    returnValue = (result.data[result.keys[me.utfDecode(key)]]);
    returnValue = returnValue ? returnValue : {'Error': 'No Data Found'};
    return returnValue;
  },
  getTileCoords: function (latLng, layer) {
    return {
      x: tileMath.long2tile(latLng.lng, layer._map.getZoom()),
      y: tileMath.lat2tile(latLng.lat, layer._map.getZoom()),
      z: layer._map.getZoom()
    };
  },
  getTileGrid: function (tileUrl, latLng, layer, callback) {
    var me = this;
    reqwest.cachedReqwest({
      url: tileUrl,
      type: 'jsonp',
      success: function (res) {
        callback(me.getTileGridPoint(latLng, res, layer));
      },
      error: function (err) {
        callback({'Error': 'No Data Found'});
      }
    });
  },
  utfDecode: function _utfDecode(key) {
    // https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js
    if (key >= 93) key--;
    if (key >= 35) key--;
    return key - 32;
  },
  hasUtfData: function(url, latLng, layer) {
    var returnValue = {'cursor': 'default'},
    cache = reqwest.getCache(url);
    if (cache) {
      if (cache.status === 'success') {
        returnValue = this.getTileGridPoint(latLng, cache.resp, layer).Error ? false : {'cursor': 'pointer'};
      } else if (cache.status === 'error') {
        returnValue = false;
      }
    }
    return returnValue;
  }
};
