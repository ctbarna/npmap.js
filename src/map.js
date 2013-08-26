'use strict';

var mapboxLayer = require('./mapbox-layer');

var Map = L.Map.extend({
  includes: [],
  options: {
    baseLayers: [{
      id: 'map-lj6szvbq',
      type: 'mapbox',
      user: 'nps'
    }],
    center: {
      lat: 39,
      lng: -96
    },
    layers: [],
    zoom: 4
  },
  initialize: function(element, _, options) {
    var i = 0;

    L.Map.prototype.initialize.call(this, element, options);

    if (this.attributionControl) {
      this.attributionControl.setPrefix('');
    }

    for (i; i < this.options.baseLayers.length; i++) {
      var baseLayer = this.options.baseLayers[i];

      if (baseLayer.visible === true || typeof baseLayer.visible === 'undefined') {
        if (baseLayer.type === 'mapbox') {
          L.npmap.mapboxLayer(baseLayer.user + '.' + baseLayer.id).addTo(this);
        } else {

        }

        break;
      }
    }

    if (!this._loaded) {
      this.setView(L.latLng(this.options.center.lat, this.options.center.lng), this.options.zoom);
    }
  }
});

module.exports = function(element, _, options) {
  return new Map(element, _, options);
};