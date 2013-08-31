/* global L */

'use strict';

var SmallZoomControl = L.Control.extend({
  options: {
    position: 'topleft'
  },
  onAdd: function(map) {
    var clsName = 'leaflet-control-zoom',
        container = L.DomUtil.create('div', clsName + ' leaflet-bar');

    this._map = map;
    this._zoomInButton = this._createButton('+', 'Zoom in', clsName + '-in', container, this._zoomIn, this);
    this._zoomOutButton = this._createButton('-', 'Zoom out', clsName + '-out', container, this._zoomOut, this);

    map.on('zoomend zoomlevelschange', this._updateDisabled, this);
    this._updateDisabled();

    return container;
  },
  onRemove: function(map) {
    map.off('zoomend zoomlevelschange', this._updateDisabled, this);
  },
  _createButton: function(html, title, clsName, container, handler, context) {
    var link = L.DomUtil.create('a', clsName, container),
        stop = L.DomEvent.stopPropagation;

    link.href = '#';
    link.innerHTML = html;
    link.title = title;

    L.DomEvent
      .on(link, 'click', stop)
      .on(link, 'mousedown', stop)
      .on(link, 'dblclick', stop)
      .on(link, 'click', L.DomEvent.preventDefault)
      .on(link, 'click', handler, context);

    return link;
  },
  _updateDisabled: function() {
    var clsName = 'leaflet-disabled',
        map = this._map;

    L.DomUtil.removeClass(this._zoomInButton, clsName);
    L.DomUtil.removeClass(this._zoomOutButton, clsName);

    if (map._zoom === map.getMinZoom()) {
      L.DomUtil.addClass(this._zoomOutButton, clsName);
    }
    if (map._zoom === map.getMaxZoom()) {
      L.DomUtil.addClass(this._zoomInButton, clsName);
    }
  },
  _zoomIn: function(e) {
    this._map.zoomIn(e.shiftKey ? 3 : 1);
  },
  _zoomOut: function(e) {
    this._map.zoomOut(e.shiftKey ? 3 : 1);
  }
});

L.Map.mergeOptions({
  smallzoomControl: true
});
L.Map.addInitHook(function() {
  if (this.options.smallzoomControl) {
    this.smallzoomControl = new L.npmap.control.smallzoom();
    this.addControl(this.smallzoomControl);
  }
});

module.exports = function(options) {
  return new SmallZoomControl(options);
};