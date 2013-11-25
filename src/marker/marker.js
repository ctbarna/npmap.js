/* global L */

'use strict';

var mustache = require('mustache');

var MakiIcon = L.Icon.extend({
  // Default options.
  options: {
    color: '#000000',
    name: null,
    size: 'medium'
  },
  // Statics.
  statics: {
    CSS_TEMPLATE: 'url(https://a.tiles.mapbox.com/v3/marker/pin-{{size}}{{name}}+{{color}}{{retina}}.png)'
  },
  /**
   *
   */
  createIcon: function(oldIcon) {
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
      options = this.options;

    options.className = null;
    options.html = null;
    this._setIconStyles(div, 'icon');
    div.style.backgroundImage = mustache.render(MakiIcon.CSS_TEMPLATE, {
      color: options.color.replace('#', ''),
      name: options.name ? '-' + options.name : null,
      retina: L.Browser.retina ? '@2x' : '',
      size: options.size.slice(0, 1)
    });
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
