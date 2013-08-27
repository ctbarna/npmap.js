/* global L */

'use strict';

var CartoDbLayer = L.TileLayer.extend({
  options: {
    opacity: 0.99,
    visible: true
  },
  initialize: function(config, options) {

  },
  setUrl: null
});

module.exports = function(config, options) {
  return new CartoDbLayer(config, options);
};