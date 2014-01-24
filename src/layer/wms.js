/* global L */

'use strict';

var util = require('../util/util');

var WmsLayer = L.TileLayer.WMS.extend({
  initialize: function(options) {
    util.strict(options.layers, 'string');
    util.strict(options.url, 'string');
    L.Util.setOptions(this, options);
    L.TileLayer.WMS.prototype.initialize.call(this, options.url, options);
    return this;
  }
});

module.exports = function(options) {
  return new WmsLayer(options);
};
