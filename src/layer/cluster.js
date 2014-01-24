/* global L */

'use strict';

require('leaflet.markercluster');

var ClusterLayer = L.MarkerClusterGroup.extend({
  options: {
    showCoverageOnHover: false
  },
  initialize: function(options) {
    var me = this;

    L.Util.setOptions(this, options);

    if (options.cluster === true) {
      options.cluster = {};
    }

    options.cluster.iconCreateFunction = new this.createCustomIconFunction(options.cluster.clusterIcon);
    L.Util.setOptions(this, options.cluster);
    options.clustered = options.cluster.iconCreateFunction('getInfo');
    delete options.cluster;
    this.L = L.npmap.layer[options.type](options);
    this._currentShownBounds = null;
    this._featureGroup = new L.FeatureGroup();
    this._featureGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
    this._inZoomAnimation = 0;
    this._needsClustering = [];
    this._needsRemoving = [];
    this._nonPointGroup = L.featureGroup();
    this._nonPointGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);
    this._queue = [];
    this.L.on('ready', function(that) {
      me.addLayer(that.target);
    }, this);

    return this;
  },
  onAdd: function(map) {
    this._map = map;
    this._addAttribution();
    L.MarkerClusterGroup.prototype.onAdd.call(this, map);
  },
  onRemove: function() {
    delete this._map;
    this._removeAttribution();
    L.MarkerClusterGroup.prototype.onRemove.call(this);
  },
  _addAttribution: function() {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(attribution);
    }
  },
  _removeAttribution: function() {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(attribution);
    }
  },
  createCustomIconFunction: function(settings) {
    var defaultSettings = [{
      name: 'small',
      maxNodes: 9,
      color: '#7A904F',
      size: 20,
      outerRing: 22,
      fontColor: '#fff'
    },{
      name: 'medium',
      maxNodes: 99,
      color: '#D49900',
      size: 35,
      outerRing: 24,
      fontColor: '#fff'
    },{
      name: 'large',
      maxNodes: Infinity,
      color: '#814705',
      size: 50,
      outerRing: 24,
      fontColor: '#fff'
    }];

    function addStyles() {
      var style = document.createElement('style');

      for (var i = 0; i < defaultSettings.length; i++) {
        var currStyle = createStyle(defaultSettings[i]);

        for (var styleType in currStyle) {
          style.textContent += '.' + 'marker-cluster-custom-' + defaultSettings[i].maxNodes.toString() + ' ' + (styleType === 'main' ? '' : styleType)  + ' {' + currStyle[styleType]  + '}\n';
        }
      }

      style.type = 'text/css';
      style.textContent += '.leaflet-cluster-anim .leaflet-marker-icon, .leaflet-cluster-anim .leaflet-marker-shadow {';
      style.textContent += '-webkit-transition: -webkit-transform 0.2s ease-out, opacity 0.2s ease-in;';
      style.textContent += '-moz-transition: -moz-transform 0.2s ease-out, opacity 0.2s ease-in;';
      style.textContent += '-o-transition: -o-transform 0.2s ease-out, opacity 0.2s ease-in;';
      style.textContent += 'transition: transform 0.2s ease-out, opacity 0.2s ease-in;';
      style.textContent += '}';
      document.getElementsByTagName('head')[0].appendChild(style);
    }
    function autoTextColor(rgb) {
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
    }
    function createStyle(style) {
      var styles = {
        main: {
          'background-clip': 'padding-box',
          'background-color': supportsRgba('rgba(' +  hexToArray(style.color)[0] +', ' +  hexToArray(style.color)[1] + ', ' +  hexToArray(style.color)[2] + ', 0.4)'),
          'border-radius': ((style.size + style.outerRing)*0.5) + 'px'
        },
        div: {
          'text-align': 'center',
          'background-color': supportsRgba('rgba(' +  hexToArray(style.color)[0] +', ' +  hexToArray(style.color)[1] + ', ' +  hexToArray(style.color)[2] + ', 0.9)'),
          width: style.size + 'px',
          height: style.size + 'px',
          'margin-left': (style.outerRing / 2) + 'px',
          'margin-top': (style.outerRing / 2) + 'px',
          'border-radius': (style.size / 2) + 'px'
        },
        span: {
          font: '12px Frutiger, "Frutiger Linotype", Univers, Calibri, "Gill Sans", "Gill Sans MT", "Myriad Pro", Myriad, "DejaVu Sans Condensed", "Liberation Sans", "Nimbus Sans L", Tahoma, Geneva, "Helvetica Neue", Helvetica, Arial, sans-serif',
          color: 'rgb(' +  hexToArray(style.fontColor)[0] +', ' +  hexToArray(style.fontColor)[1] + ', ' +  hexToArray(style.fontColor)[2] + ')',
          'line-height': style.size + 'px'
        }
      };

      function cssStyle(fields) {
        var returnValue = [];
        for (var field in fields) {
          returnValue.push(field + ': ' + fields[field] +'; ');
        }
        return returnValue.join('');
      }
      function styleLoop(fields, process) {
        var returnValue = {};

        for (var field in fields) {
          returnValue[field] = process(fields[field]);
        }

        return returnValue;
      }

      return styleLoop(styles, cssStyle);
    }
    function customIconCreateFunction(cluster) {
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

      return new L.DivIcon({html: '<div><span>' + childCount + '</span></div>', className: className, iconSize: new L.Point(size, size) });
    }
    function hexToArray(hexValue) {
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
    }
    function supportsRgba(color) {
      var returnValue = false,
        rgbaTestVal = 'rgba(0,0,0,0.1)',
        testDiv = document.createElement('div'),
        newColor;

      testDiv.style.color = rgbaTestVal;

      if (testDiv.style.color.substr(0,4) === 'rgba') {
        returnValue = true;
      }

      if (color) {
        if (returnValue) {
          return color;
        } else {
          newColor = color.replace(/^rgba\(/g, 'rgb(,').replace(')','').split(',');
          newColor[1] = Math.floor(parseInt(newColor[1],10) + (255 * (1 - parseFloat(newColor[4], 10))));
          newColor[2] = Math.floor(parseInt(newColor[2],10) + (255 * (1 - parseFloat(newColor[4], 10))));
          newColor[3] = Math.floor(parseInt(newColor[3],10) + (255 * (1 - parseFloat(newColor[4], 10))));
          if (newColor[1] > 255) {newColor[1] = 255;}
          if (newColor[2] > 255) {newColor[2] = 255;}
          if (newColor[3] > 255) {newColor[3] = 255;}
          newColor = newColor.slice(0,4).join(',').replace('(,','(') + ')';

          return newColor;
        }
      } else {
        return returnValue;
      }
    }
    function updateDefaults(newSettings) {
      for (var j = 0; j < defaultSettings.length; j++) {
        if (defaultSettings[j].name && newSettings[defaultSettings[j].name]) {
          L.Util.extend(defaultSettings[j], newSettings[defaultSettings[j].name]);

          if (!newSettings[defaultSettings[j].name].fontColor && newSettings[defaultSettings[j].name].color) {
            defaultSettings[j].fontColor = autoTextColor(hexToArray(newSettings[defaultSettings[j].name].color));
          }
        }
      }
    }

    if (settings) {
      if (typeof settings === 'string') {
        updateDefaults({'small': {'color': settings}, 'medium': {'color': settings}, 'large': {'color': settings}});
      } else if (Object.prototype.toString.call(settings) === '[object Object]') {
        updateDefaults(settings);
      } else if (Object.prototype.toString.call(settings) === '[object Array]') {
        defaultSettings = settings;
      }
    }

    addStyles();
    return customIconCreateFunction;
  }
});

module.exports = function(options) {
  return new ClusterLayer(options);
};
