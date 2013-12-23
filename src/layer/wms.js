/* global L */

'use strict';

var util = require('../util/util');

var WmsLayer = L.TileLayer.WMS.extend({
  initialize: function(config) {
    util.strict(config.layers, 'string');
    util.strict(config.url, 'string');
    L.TileLayer.WMS.prototype.initialize.call(this, config.url, config);
    return this;
  }
});

module.exports = function(config) {
  return new WmsLayer(config);
};
