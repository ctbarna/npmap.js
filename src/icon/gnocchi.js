/* global L */

'use strict';

var util = require('../util/util');

var MakiIcon = L.Icon.extend({
  options: {
    color: '#000000',
    name: null,
    size: 'medium'
  },
  statics: {
    CSS_TEMPLATE: 'url(https://a.tiles.mapbox.com/v3/marker/pin-{{size}}+{{color}}{{retina}}.png)'
  },
  initialize: function(options) {
    options = options || {};
    
    // Add the CSS
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'http://192.168.33.10:1337/theme/images/icons/maki/www/maki-sprite.css');
    window.onload = function() {
      document.body.appendChild(link);
    };


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
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
      options = this.options;

    var overlayDiv = document.createElement('div');
    overlayDiv.setAttribute('class', 'maki-icon ' + options.name  + ' leaflet-zoom-animated');
    overlayDiv.setAttribute('tabindex', '0');
    // TODO: make this come from the list above
    overlayDiv.setAttribute('style', 'margin-left: 5px; margin-top: 6px;');
    options.className = null;
    options.html = null;
    this._setIconStyles(div, 'icon');
    div.style.backgroundImage = util.handlebars(MakiIcon.CSS_TEMPLATE, {
      color: options.color.replace('#', ''),
      retina: L.Browser.retina ? '@2x' : '',
      size: options.size.slice(0, 1)
    });
    console.log('appending');
    div.appendChild(overlayDiv);
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
