/* global L */

'use strict';

var HomeControl = L.Control.extend({
  options: {
    position: 'topleft'
  },
  initialize: function(options) {
    L.Util.extend(this.options, options);
    return this;
  },
  onAdd: function() {
    var container = L.DomUtil.create('div', 'leaflet-control-home leaflet-bar leaflet-control'),
      link = L.DomUtil.create('a', 'leaflet-bar-single', container),
      stop = L.DomEvent.stopPropagation;

    link.href = '#';
    link.title = 'Pan/zoom to initial extent';

    L.DomEvent
      .on(link, 'click', stop)
      .on(link, 'mousedown', stop)
      .on(link, 'dblclick', stop)
      .on(link, 'click', L.DomEvent.preventDefault)
      .on(link, 'click', this.toHome, this);

    return container;
  },
  toHome: function() {
    var map = this._map,
      options = map.options;

    map.setView(options.center, options.zoom);
  }
});

L.Map.mergeOptions({
  homeControl: false
});
L.Map.addInitHook(function() {
  if (this.options.homeControl) {
    var options = {};

    if (typeof this.options.homeControl === 'object') {
      options = this.options.homeControl;
    }

    this.homeControl = L.npmap.control.home(options).addTo(this);
  }
});

module.exports = function(options) {
  return new HomeControl(options);
};
