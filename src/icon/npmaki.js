/* global L */

'use strict';

var util = require('../util/util');

var NpmakiIcon = L.Icon.extend({
  options: {
    color: '#000000',
    size: 'medium',
    symbol: null
  },
  statics: {
    MAKI_TEMPLATE: 'url(https://a.tiles.mapbox.com/v3/marker/pin-{{size}}+{{color}}{{retina}}.png)'
  },
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
  },
  createIcon: function(oldIcon) {
    var options = this.options,
      divIcon = L.DomUtil.create('div', 'npmaki-icon ' + options.size + ' ' + options.symbol + '-' + options.size + (L.Browser.retina ? '-2x': '')),
      divMarker = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div');

    options.className = null;
    options.html = null;
    this._setIconStyles(divMarker, 'icon');
    divMarker.style.backgroundImage = util.handlebars(NpmakiIcon.MAKI_TEMPLATE, {
      color: options.color.replace('#', ''),
      retina: L.Browser.retina ? '@2x' : '',
      size: options.size.slice(0, 1)
    });
    divMarker.appendChild(divIcon);
    return divMarker;



    /*
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
      options = this.options,
      overlayDiv = document.createElement('div');

    overlayDiv.setAttribute('class', 'maki-icon ' + (typeof options.symbol === 'string' && options.symbol.length ? options.symbol : '') + ' leaflet-zoom-animated');
    overlayDiv.setAttribute('style', 'margin-left:5px;margin-top:6px;');
    options.className = null;
    options.html = null;
    this._setIconStyles(div, 'icon');
    div.style.backgroundImage = util.handlebars(NpmakiIcon.CSS_TEMPLATE, {
      color: options.color.replace('#', ''),
      retina: L.Browser.retina ? '@2x' : '',
      size: options.size.slice(0, 1)
    });
    div.appendChild(overlayDiv);
    return div;
    */
  },
  createShadow: function() {
    return null;
  }
});

module.exports = function(options) {
  return new NpmakiIcon(options);
};
