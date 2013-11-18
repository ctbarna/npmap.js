/* global L */

'use strict';

var colorPresets = require('../preset/colors.json'),
  iconPresets = require('../preset/icons.json'),
  layerPresets = require('../preset/layers.json'),
  util = require('../util/util');

var Map = L.Map.extend({
  options: {
    zoomControl: false
  },
  /**
   *
   */
  initialize: function(config) {
    var container = L.DomUtil.create('div', 'npmap-container'),
      map = L.DomUtil.create('div', 'npmap-map'),
      mapWrapper = L.DomUtil.create('div', 'npmap-map-wrapper'),
      modules = L.DomUtil.create('div', 'npmap-modules'),
      npmap = L.DomUtil.create('div', 'npmap'),
      toolbar = L.DomUtil.create('div', 'npmap-toolbar');

    config = this._toLeaflet(config);
    config.div.insertBefore(npmap, config.div.childNodes[0]);
    npmap.appendChild(modules);
    npmap.appendChild(container);
    container.appendChild(toolbar);
    container.appendChild(mapWrapper);
    mapWrapper.appendChild(map);
    config.div = map;
    L.Map.prototype.initialize.call(this, config.div, config);

    if (this.attributionControl) {
      this.attributionControl.setPrefix('');
    }

    if (!this._loaded) {
      this.setView(config.center, config.zoom);
    }

    this._setupPopup();
    this._setupTooltip();

    return this;
  },
  /**
   *
   */
  _setCursor: function(type) {
    this._container.style.cursor = type;
  },
  /**
   *
   */
  _setupPopup: function() {
    var me = this,
      popup = me._popup = L.popup({
        autoPanPaddingBottomRight: [20, 20],
        autoPanPaddingTopLeft: [55, 20],
        maxHeight: 300,
        maxWidth: 221,
        minWidth: 221,
        offset: [0, -2]
      });

    me.on('click', function(e) {
      var latLng = e.latlng.wrap(),
        queryable = [],
        layer;

      for (var layerId in me._layers) {
        layer = me._layers[layerId];

        if ((typeof layer.options.popup === 'undefined' || layer.options.popup !== false) && typeof layer._handleClick === 'function') {
          if (typeof layer._isQueryable === 'function') {
            if (layer._isQueryable(latLng)) {
              queryable.push(layer);
            }
          } else {
            queryable.push(layer);
          }
        }
      }

      if (queryable.length) {
        var completed = 0,
          results = [],
          interval;

        for (var i = 0; i < queryable.length; i++) {
          layer = queryable[i];
          layer._handleClick(latLng, layer, function(l, data) {
            if (data) {
              var result = util.dataToHtml(l.options, data);

              if (result) {
                results.push(result);
              }
            }

            completed++;
          });
        }

        // TODO: Add support for a timeout so the infobox displays even if one or more operations fail.
        interval = setInterval(function() {
          if (queryable.length === completed) {
            clearInterval(interval);

            if (results.length) {
              var html = '';

              for (var i = 0; i < results.length; i++) {
                html += util.getOuterHtml(results[i]);
              }

              popup.setContent(html).setLatLng(latLng).openOn(me);
            }
          }
        }, 100);
      }
    });
  },
  /**
   *
   */
  _setupTooltip: function() {
    var me = this;

    me.on('click', function() {
      // TODO: Hide tooltip
    });
    me.on('mousemove', function(e) {
      var latLng = e.latlng.wrap();
          //,
          //results = [];

      me._setCursor('default');

      for (var layerId in me._layers) {
        var layer = me._layers[layerId];

        if (typeof layer._handleMousemove === 'function' && typeof layer._isQueryable === 'function' && layer._isQueryable(latLng)) {
          me._setCursor('pointer');

          /*
          if (layer.options.tooltip) {
            layer._handleMousemove(latLng, layer, function(layer, data) {
              if (data) {
                var result = util.dataToHtml(layer.options, data, 'tooltip');

                if (result) {
                  results.push(result);
                }
              }
            });
          }
          */
        }
      }

      /*
      if (results.length) {
        var html = '';

        for (var j = 0; j < results.length; j++) {
          html += util.getOuterHtml(results[j]);
        }

        //console.log(html);
        //tooltip.setContent(html).setLatLng(latLng).openOn(me);
      }
      */
    });
  },
  /**
   * Converts an NPMap.js map config object to a Leaflet map config object.
   * @param {Object} config
   * @return {Object} config
   */
  _toLeaflet: function(config) {
    if (!config.div || (typeof config.div !== 'string' && typeof config.div !== 'object')) {
      throw new Error('The map config object must have a div property');
    }

    if (typeof config.div === 'string') {
      config.div = document.getElementById(config.div);
    }

    if (config.layers && L.Util.isArray(config.layers) && config.layers.length) {
      config.overlays = config.layers;
      config.layers = [];
    } else if (config.overlays && L.Util.isArray(config.overlays) && config.overlays.length) {
      config.layers = [];
    } else {
      config.layers = [];
      config.overlays = [];
    }

    config.baseLayers = (function() {
      var visible = false;

      if (config.baseLayers && L.Util.isArray(config.baseLayers) && config.baseLayers.length) {
        for (var i = 0; i < config.baseLayers.length; i++) {
          var baseLayer = config.baseLayers[i];

          if (typeof baseLayer === 'string') {
            var name = baseLayer.split('-');

            baseLayer = config.baseLayers[i] = layerPresets[name[0]][name[1]];
          }

          baseLayer.zIndex = 0;

          if (baseLayer.visible === true || typeof baseLayer.visible === 'undefined') {
            if (visible) {
              baseLayer.visible = false;
            } else {
              baseLayer.visible = true;
              visible = true;
            }
          } else {
            baseLayer.visible = false;
          }
        }
      }

      if (visible) {
        return config.baseLayers;
      } else {
        var active = layerPresets.nps.lightStreets;
        active.visible = true;
        active.zIndex = 0;
        return [active];
      }
    })();
    config.center = (function() {
      var c = config.center;

      if (c) {
        return L.latLng(c.lat, c.lng);
      } else {
        return L.latLng(39, -96);
      }
    })();
    config.zoom = typeof config.zoom === 'number' ? config.zoom : 4;

    for (var i = 0; i < config.baseLayers.length; i++) {
      var baseLayer = config.baseLayers[i];

      if (baseLayer.visible === true) {
        baseLayer.L = L.npmap.layer[baseLayer.type](baseLayer);
        config.layers.push(baseLayer.L);
        break;
      }
    }

    if (config.overlays.length) {
      for (var j = 0; j < config.overlays.length; j++) {
        var layer = config.overlays[j];

        if (layer.visible || typeof layer.visible === 'undefined') {
          layer.visible = true;
          config.overlays[j].L = L.npmap.layer[layer.type](layer);
          config.layers.push(config.overlays[j].L);
        } else {
          layer.visible = false;
        }
      }
    }

    return config;
  }
});

(function() {
  // TODO: Setup "shortcuts" for pre-defined styles, taken from Mamata's color palettes.
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
})();

module.exports = function(config) {
  return new Map(config);
};
