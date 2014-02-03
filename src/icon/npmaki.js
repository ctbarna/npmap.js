/* global L */

'use strict';

var util = require('../util/util');

var NpmakiIcon = L.Icon.extend({
  options: {
    'marker-color': '#000000',
    'marker-size': 'medium'
  },
  statics: {
    MAKI_TEMPLATE: 'url(https://a.tiles.mapbox.com/v3/marker/pin-{{size}}+{{color}}{{retina}}.png)'
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
    L.Util.setOptions(this, options);
  },
  createIcon: function(oldIcon) {
    var options = this.options,
      divIcon = L.DomUtil.create('div', 'npmaki-icon ' + options['marker-size'] + ' ' + options['marker-symbol'] + '-' + options['marker-size'] + (L.Browser.retina ? '-2x': '')),
      divMarker = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div');

    //options.className = null;
    //options.html = null;
    this._setIconStyles(divMarker, 'icon');
    divMarker.style.backgroundImage = util.handlebars(NpmakiIcon.MAKI_TEMPLATE, {
      color: options['marker-color'].replace('#', ''),
      retina: L.Browser.retina ? '@2x' : '',
      size: options['marker-size'].slice(0, 1)
    });
    divMarker.appendChild(divIcon);
    return divMarker;
  },
  createShadow: function() {
    return null;
  }
});

module.exports = function(options) {
  return new NpmakiIcon(options);
};
