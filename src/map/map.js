/* global L */

'use strict';

var Map = L.Map.extend({
  options: {
    zoomControl: false
  },
  initialize: function(config) {
    var element = typeof config.div === 'string' ? document.getElementById(config.div) : config.div;

    L.Map.prototype.initialize.call(this, element, config);

    if (this.attributionControl) {
      this.attributionControl.setPrefix('');
    }

    return this;
  }
});

(function() {
  // TODO: Setup "shortcuts" for pre-defined styles, taken from Mamata's work on colors.
  var style = {
    color: '#d9bd38',
    fill: true,
    fillColor: '#d9bd38',
    fillOpacity: 0.2,
    opacity: 0.8,
    stroke: true,
    weight: 3
  };

  L.CircleMarker.mergeOptions({
    color: '#000',
    fillColor: '#7a4810',
    fillOpacity: 0.8,
    opacity: 1,
    radius: 8,
    weight: 1
  });
  // TODO: Update these with default NPS icon.
  L.Marker.mergeOptions({
    icon: new L.Icon.Default(),
    opacity: 1.0
  });
  L.Path.mergeOptions(style);
  L.Polygon.mergeOptions(style);
  L.Polyline.mergeOptions(style);
  L.Popup.mergeOptions({
    autoPanPadding: L.point(45, 20), // autoPanPadding: L.bounds(L.point(45, 20), L.point(20, 20))
    offset: L.point(0, -8)
  });
})();

module.exports = function(config) {
  return new Map(config);
};