/* global L */

'use strict';

var mustache = require('mustache');

var MakiIcon = L.Icon.extend({
  //
  options: {
    className: 'leaflet-maki-icon',
    color: '000000',
    name: null,
    size: 'medium'
  },
  //
  statics: {
    HTML_TEMPLATE: '<div style="background-image:url(https://a.tiles.mapbox.com/v3/marker/pin-{{size}}{{name}}+{{color}}{{retina}}.png);"></div>'
  },
  /**
   *
   */
  createIcon: function(oldIcon) {
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
      options = this.options;

    options.html = mustache.render(MakiIcon.HTML_TEMPLATE, {
      color: '000000',
      name: null,
      //retina: L.Browser.retina ? '@2x' : '',
      retina: '',
      size: options.size.slice(0, 1)
    });

    div.innerHTML = options.html;
    this._setIconStyles(div, 'icon');
    return div;
  },
  /**
   *
   */
  createShadow: function() {
    return null;
  },
  /**
   *
   */
  initialize: function(options) {
    options = options || {};

    var size = options.size || 'medium',
      sizes = {
        large: {
          iconAnchor: [17.5, 49],
          iconSize: [35, 55],
          popupAnchor: [2, -45]
        },
        medium: {
          iconAnchor: [14, 36],
          iconSize: [28, 41],
          popupAnchor: [2, -34]
        },
        small: {
          iconAnchor: [10, 24],
          iconSize: [20, 30],
          popupAnchor: [2, -24]
        }
      };

    L.Util.extend(options, sizes[size]);
    L.Util.setOptions(this, options);
  }
});

L.Marker.mergeOptions({
  icon: new MakiIcon()
});

module.exports = function(options) {
  return new MakiIcon(options);
};
