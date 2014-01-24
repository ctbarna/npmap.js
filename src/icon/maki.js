/* global L */

'use strict';

var util = require('../util/util');

var MakiIcon = L.Icon.extend({
  options: {
    'marker-color': '#000000',
    'marker-size': 'medium'
  },
  statics: {
    CSS_TEMPLATE: 'url(https://a.tiles.mapbox.com/v3/marker/pin-{{size}}{{symbol}}+{{color}}{{retina}}.png)'
  },
  initialize: function(options) {
    options = options || {};

    var size = options['marker-size'] || 'medium',
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
    L.setOptions(this, options);
  },
  createIcon: function(oldIcon) {
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
      options = this.options;

    options.className = null;
    options.html = null;
    this._setIconStyles(div, 'icon');
    div.style.backgroundImage = util.handlebars(MakiIcon.CSS_TEMPLATE, {
      color: options['marker-color'].replace('#', ''),
      retina: L.Browser.retina ? '@2x' : '',
      size: options['marker-size'].slice(0, 1),
      symbol: options['marker-symbol'] ? '-' + options['marker-symbol'] : ''
    });
    return div;
  },
  createShadow: function() {
    return null;
  }
});

L.Marker.mergeOptions({
  icon: new MakiIcon()
});

module.exports = function(options) {
  return new MakiIcon(options);
};
