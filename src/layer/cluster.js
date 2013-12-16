/* global L */

'use strict';

//var util = require('../util/util');
require('../cluster/leaflet.markercluster-src');

var ClusterLayer = L.MarkerClusterGroup.extend({
  initialize: function(config) {
    // The config uses all available options here: https://github.com/Leaflet/Leaflet.markercluster/blob/master/README.md#all-options
    // It also supports a custom color option
    // clusterIcon = false -- defaults to three colors, green for small, yellow for medium, and brown/red for large
    // clusterIcon = #color -- sets all sizes to the defined color
    // clusterIcon = object {small: {color: #color}, medium: {color: #color}, large: {color: #color}} -- gives you access to change any parameter, but still limits you to the 3 sizes
    // clusterIcon = array [] -- allows you to define as many different cluster sizes as you like
    //config.cluster.iconCreateFunction = new this.CreateCustomIconFunction({small: {color: '#0f0'}, medium: {color: '#f00'}, large: {color: '00f'}});
    config.cluster.iconCreateFunction = new this.CreateCustomIconFunction(config.cluster.clusterIcon);
    L.Util.setOptions(this, config.cluster);
    config.clustered = config.cluster.iconCreateFunction('getInfo');
    delete config.cluster;
    this.L = L.npmap.layer[config.type](config);

    // Defaults
    //
    if (!this.options.iconCreateFunction) {
      this.options.iconCreateFunction = this._defaultIconCreateFunction;
    }
    this._featureGroup = L.featureGroup();
    this._featureGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

    this._nonPointGroup = L.featureGroup();
    this._nonPointGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

    this._inZoomAnimation = 0;
    this._needsClustering = [];
    this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of
    //The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
    this._currentShownBounds = null;
    //
    // Assign options
    this.showCoveageOnHover = false;

    var that = this;
    this.L.on('ready', function(me) {
      that.addLayer(me.target);
    }, this);

    return this;
  },
  CreateCustomIconFunction: function (settings) {
    // Define the default settings
    var defaultSettings = [{
      'name': 'small',
      'maxNodes': 9,
      'color': '#7A904F', //122, 144, 79
      'size': 20,
      'outerRing': 22,
      'fontColor': '#fff'
    }, {
      'name': 'medium',
      'maxNodes': 99,
      'color': '#D49900', //212, 153, 0
      'size': 35,
      'outerRing': 24,
      'fontColor': '#fff'
    }, {
      'name': 'large',
      'maxNodes': Infinity,
      'color': '#814705', //129, 71, 5
      'size': 50,
      'outerRing': 24,
      'fontColor': '#fff'
    }],
    createStyle = function (style) {
      var styles = {
        main: {
          'background-clip': 'padding-box',
          'background-color': 'rgba(' +  hexToArray(style.color)[0] +', ' +  hexToArray(style.color)[1] + ', ' +  hexToArray(style.color)[2] + ', 0.4)',
          'width': (style.size + style.outerRing) + 'px',
          'height': (style.size + style.outerRing) +'px',
          'margin-left': ((style.size + style.outerRing)*-0.5) + 'px',
          'margin-top': ((style.size + style.outerRing)*-0.5) + 'px',
          'border-radius': ((style.size + style.outerRing)*0.5) + 'px'
        },
        div: {
          'text-align': 'center',
          'background-color': 'rgba(' +  hexToArray(style.color)[0] +', ' +  hexToArray(style.color)[1] + ', ' +  hexToArray(style.color)[2] + ', 0.9)',
          'width': style.size + 'px',
          'height': style.size + 'px',
          'margin-left': (style.outerRing / 2) + 'px',
          'margin-top': (style.outerRing / 2) + 'px',
          'border-radius': (style.size / 2) + 'px'
        },
        span: {
          'font': '12px "Helvetica Neue", Arial, Helvetica, sans-serif',
          'color': 'rgb(' +  hexToArray(style.fontColor)[0] +', ' +  hexToArray(style.fontColor)[1] + ', ' +  hexToArray(style.fontColor)[2] + ')',
          'line-height': style.size + 'px'
        }
      },
      cssStyle = function(fields) {
        var returnValue = [];
        for (var field in fields) {
          returnValue.push(field + ': ' + fields[field] +'; ');
        }
        return returnValue.join('');
      },
      styleLoop = function(fields, process) {
        var returnValue = {};
        for (var field in fields) {
          returnValue[field] = process(fields[field]);
        }
        return returnValue;
      };

      return styleLoop(styles, cssStyle);
    },
    customIconCreateFunction = function (cluster) {
      // Support a get info request
      if (cluster === 'getInfo') {
        return defaultSettings;
      }
      var childCount = cluster.getChildCount(),
      className, size;

      for (var markerIndex = 0; markerIndex < defaultSettings.length; markerIndex++) {
        if (childCount <= defaultSettings[markerIndex].maxNodes) {
          className = 'marker-cluster-custom-' + defaultSettings[markerIndex].maxNodes.toString();
          size = defaultSettings[markerIndex].size + defaultSettings[markerIndex].outerRing;
          break;
        }
      }

      var divIcon = new L.DivIcon({html: '<div><span>' + childCount + '</span></div>', className: className, iconSize: new L.Point(size, size) });
      return divIcon;
    },
    addStyles = function() {
      // TODO: Add IE 6-8 rgb fixes
      var styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      for (var i = 0; i < defaultSettings.length; i++) {
        var currStyle = createStyle(defaultSettings[i]);
        for (var styleType in currStyle) {
          var styleName = styleType === 'main' ? '' : styleType;
          styleElement.textContent += '.' + 'marker-cluster-custom-' + defaultSettings[i].maxNodes.toString() + ' ' + styleName  + ' {' + currStyle[styleType]  + '}\n';
        }
      }
      document.getElementsByTagName('head')[0].appendChild(styleElement);
    },
    hexToArray = function(hexValue) {
      var returnValue = false;
      if (typeof(hexValue) === 'string') {
        hexValue = hexValue.replace('#', '');
        if (hexValue.length === 3) {
          hexValue = hexValue.replace(/(.)(.)(.)/g, '$1$1$2$2$3$3');
        }
        if (hexValue.match(/[\da-fA-F]{6}$/)) {
          returnValue = [
            parseInt(hexValue.substr(0,2), 16),
            parseInt(hexValue.substr(2,2), 16),
            parseInt(hexValue.substr(4,2), 16)
          ];
        }
      }
      return returnValue;
    },
    autoTextColor = function(rgb) {
      // This determines if the background is too light to use a white text color
      // http://www.wat-c.org/tools/CCA/1.1/
      if (Object.prototype.toString.call(rgb) !== '[object Array]') {
        rgb = hexToArray(rgb);
      }
      if (rgb) {
        var brightness = (((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2]* 144)) / 1000);
        if (brightness > 127) {
          return '#000';
        } else {
          return '#fff';
        }
      } else {
        return false;
      }
    },
    updateDefaults = function(newSettings) {
      for (var j = 0; j < defaultSettings.length; j++) {
        if (defaultSettings[j].name && newSettings[defaultSettings[j].name]) {
          // Add the new settings to the default settings
          L.Util.extend(defaultSettings[j], newSettings[defaultSettings[j].name]);

          // If the background is changed without changing the font color, we can change the font automatically
          if (!newSettings[defaultSettings[j].name].fontColor && newSettings[defaultSettings[j].name].color) {
            defaultSettings[j].fontColor = autoTextColor(hexToArray(newSettings[defaultSettings[j].name].color));
          }
        }
      }
    };

    // Read the settings
    if (settings) {
      if (typeof(settings) === 'string') {
        // This might be a color in hex
        updateDefaults({'small': {'color': settings}, 'medium': {'color': settings}, 'large': {'color': settings}});
      } else if (Object.prototype.toString.call(settings) === '[object Object]') {
        updateDefaults(settings);
        // This might be colors in an object
      } else if (Object.prototype.toString.call(settings) === '[object Array]') {
        // This is an advanced user
        defaultSettings = settings;
      }
    }

    addStyles();
    return customIconCreateFunction;
  }
});

module.exports = function(config) {
  return new ClusterLayer(config);
};
