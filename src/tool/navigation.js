/* global L */

'use strict';

var NavigationControl = L.Control.extend({
  includes: L.Mixin.Events,

  options: {
    position: 'topleft'
  },

  initialize: function(_) {

  },
  onAdd: function(map) {
    var container = L.DomUtil.create('div', 'leaflet-control-npmap-navigation leaflet-bar leafet-control');

    L.DomEvent.disableClickPropagation(container);

    this._map = map;

    return container;
  }
});

module.exports = function(options) {
  return new NavigationControl(options);
};