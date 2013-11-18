/* global L */

'use strict';

var util = require('../util/util');

var TiledLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  initialize: function(config) {
    util.strict(config.url, 'string');
    L.TileLayer.prototype.initialize.call(this, config.url, config);
    return this;
  }
});

module.exports = function(config) {
  return new TiledLayer(config);
};
