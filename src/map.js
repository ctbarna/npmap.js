/* global L */

'use strict';

var baselayerPresets = require('./preset/baselayers.json'),
  colorPresets = require('./preset/colors.json'),
  overlayPresets = require('./preset/overlays.json'),
  util = require('./util/util');

// Override and setup defaults.
(function() {
  var style = colorPresets.gold;

  L.Circle.mergeOptions(style);
  L.CircleMarker.mergeOptions(style);
  L.Control.Attribution.mergeOptions({
    prefix: '<a href="http://www.nps.gov/npmap/disclaimer.html" target="_blank">Disclaimer</a>'
  });
  L.Polygon.mergeOptions(style);
  L.Polyline.mergeOptions({
    color: style.color,
    opacity: style.opacity,
    weight: style.weight
  });
  L.Popup.mergeOptions({
    autoPanPaddingBottomRight: [20, 20],
    autoPanPaddingTopLeft: [20, 20],
    maxHeight: 300,
    maxWidth: 221,
    minWidth: 221,
    offset: [1, -3]
  });
  L.Map.addInitHook(function() {
    var me = this;

    function resize() {
      var container = me.getContainer(),
        left = util.getOuterDimensions(util.getChildElementsByClassName(container, 'leaflet-control-container')[0].childNodes[2]).width;

      if (left) {
        left = left + 20;
      }

      util.getChildElementsByClassName(container, 'leaflet-control-attribution')[0].style['max-width'] = (util.getOuterDimensions(container).width - left) + 'px';
    }

    if (this.options.attributionControl) {
      this.attributionControl._update = function() {
        var attribs = [],
          prefixAndAttribs = [];

        for (var attribution in this._attributions) {
          if (this._attributions[attribution] > 0) {
            var i = -1;

            if (attribution) {
              for (var j = 0; j < attribs.length; j++) {
                if (attribs[j] === attribution) {
                  i = j;
                  break;
                }
              }

              if (i === -1) {
                attribs.push(attribution);
              }
            }
          }
        }

        if (this.options.prefix) {
          prefixAndAttribs.push(this.options.prefix);
        }

        if (attribs.length) {
          prefixAndAttribs.push(attribs.join(' | '));
        }

        this._container.innerHTML = prefixAndAttribs.join(' | ');
      };
      this.on('resize', resize);
      resize();
    }
  });
})();

var Map = L.Map.extend({
  options: {
    zoomControl: false
  },
  initialize: function(config) {
    var container = L.DomUtil.create('div', 'npmap-container'),
      map = L.DomUtil.create('div', 'npmap-map'),
      mapWrapper = L.DomUtil.create('div', 'npmap-map-wrapper'),
      me = this,
      modules = L.DomUtil.create('div', 'npmap-modules'),
      npmap = L.DomUtil.create('div', 'npmap'),
      toolbar = L.DomUtil.create('div', 'npmap-toolbar'),
      toolbarLeft = L.DomUtil.create('div', null),
      toolbarRight = L.DomUtil.create('div', null);

    config = me._toLeaflet(config);
    config.div.insertBefore(npmap, config.div.hasChildNodes() ? config.div.childNodes[0] : null);
    npmap.appendChild(modules);
    npmap.appendChild(container);
    toolbarLeft.style.cssText = 'float:left;';
    toolbarRight.style.cssText = 'float:right;';
    toolbar.appendChild(toolbarLeft);
    toolbar.appendChild(toolbarRight);
    container.appendChild(toolbar);
    container.appendChild(mapWrapper);
    mapWrapper.appendChild(map);
    config.div = map;
    L.Map.prototype.initialize.call(me, config.div, config);

    if (!me._loaded) {
      me.setView(config.center, config.zoom);
    }

    me._setupPopup();
    me._setupTooltip();
    me.on('autopanstart', function() {
      me._setCursor('default');
    });

    for (var i = 0; i < config.baseLayers.length; i++) {
      var baseLayer = config.baseLayers[i];

      baseLayer.zIndex = 0;

      if (baseLayer.visible === true) {
        baseLayer.L = L.npmap.layer[baseLayer.type](baseLayer);
        me.addLayer(baseLayer.L);
        break;
      }
    }

    if (config.overlays.length) {
      var zIndex = 1;

      for (var j = 0; j < config.overlays.length; j++) {
        var overlay = config.overlays[j];

        if (overlay.visible || typeof overlay.visible === 'undefined') {
          overlay.visible = true;
          overlay.zIndex = zIndex;
          overlay.L = L.npmap.layer[overlay.type](overlay);
          me.addLayer(overlay.L);
          zIndex++;
        } else {
          overlay.visible = false;
        }
      }
    }

    return this;
  },
  _setCursor: function(type) {
    this._container.style.cursor = type;
  },
  _setupPopup: function() {
    var me = this;

    me.on('click', function(e) {
      var changed = false,
        queryable = [],
        layer;

      function mapChanged() {
        changed = true;
      }

      me
        .on('dragstart', mapChanged)
        .on('movestart', mapChanged)
        .on('zoomstart', mapChanged);

      for (var layerId in me._layers) {
        layer = me._layers[layerId];

        if ((typeof layer.options.popup === 'undefined' || layer.options.popup !== false) && typeof layer._handleClick === 'function' && layer._hasInteractivity !== false) {
          queryable.push(layer);
        }
      }

      if (queryable.length) {
        var completed = 0,
          lastCursor = me.getContainer().style.cursor,
          latLng = e.latlng.wrap(),
          results = [],
          interval;

        me._setCursor('wait');

        for (var i = 0; i < queryable.length; i++) {
          layer = queryable[i];
          layer._handleClick(latLng, layer, function(l, data) {
            if (data) {
              var result;

              if (typeof data === 'string') {
                result = data;
              } else {
                result = util.dataToHtml(l.options, data);
              }

              if (result) {
                results.push(result);
              }
            }

            completed++;
          });
        }

        // TODO: Add support for a timeout so the infobox displays even if one or more operations fail.
        interval = setInterval(function() {
          if (changed) {
            clearInterval(interval);
            me._setCursor(lastCursor);
            me
              .off('dragstart', mapChanged)
              .off('movestart', mapChanged)
              .off('zoomstart', mapChanged);
          } else {
            if (queryable.length === completed) {
              clearInterval(interval);
              me
                .off('dragstart', mapChanged)
                .off('movestart', mapChanged)
                .off('zoomstart', mapChanged);

              if (results.length) {
                var html = '',
                  popup = L.popup({
                    autoPanPaddingTopLeft: util._getAutoPanPaddingTopLeft(me.getContainer())
                  });

                for (var i = 0; i < results.length; i++) {
                  var result = results[i];

                  if (typeof result === 'string') {
                    html += results[i];
                  } else {
                    html += util.getOuterHtml(results[i]);
                  }
                }

                popup.setContent(html).setLatLng(latLng).openOn(me);
              }

              me._setCursor(lastCursor);
            }
          }
        }, 100);
      }
    });
  },
  _setupTooltip: function() {
    var activeTips = [],
      me = this,
      tooltip = L.npmap.tooltip({
        map: me,
        padding: '7px 10px'
      });

    me._tooltips = [];

    L.DomEvent.on(util.getChildElementsByClassName(me.getContainer(), 'leaflet-popup-pane')[0], 'mousemove', function(e) {
      L.DomEvent.stopPropagation(e);
      tooltip.hide();
    });
    me.on('mousemove', function(e) {
      var hasData = false,
        latLng = e.latlng.wrap(),
        newActiveTips = [];

      tooltip.hide();
      me._setCursor('default');

      for (var i = 0; i < me._tooltips.length; i++) {
        if (activeTips.indexOf(me._tooltips[i]) === -1) {
          newActiveTips.push(me._tooltips[i]);
        }
      }

      activeTips = [];
      me._tooltips = newActiveTips;

      for (var layerId in me._layers) {
        var layer = me._layers[layerId];

        if (typeof layer._handleMousemove === 'function' && layer._hasInteractivity !== false) {
          layer._handleMousemove(latLng, layer, function(l, data) {
            if (data) {
              var tip;

              if (!hasData) {
                hasData = true;
              }

              if (typeof layer.options.tooltip === 'function') {
                tip = layer.options.tooltip(data);
              } else if (typeof layer.options.tooltip === 'string') {
                tip = util.handlebars(layer.options.tooltip, data);
              }

              if (tip) {
                me._tooltips.push(tip);
                activeTips.push(tip);
              }
            }
          });
        }
      }

      if (hasData) {
        me._setCursor('pointer');
      }

      if (me._tooltips.length) {
        tooltip.show(e.containerPoint, me._tooltips.join('<br>'));
      }
    });
  },
  _toLeaflet: function(config) {
    if (!config.div || (typeof config.div !== 'string' && typeof config.div !== 'object')) {
      throw new Error('The map config object must have a div property');
    }

    if (typeof config.div === 'string') {
      config.div = document.getElementById(config.div);
    }

    if (config.layers && L.Util.isArray(config.layers) && config.layers.length) {
      config.overlays = config.layers;
    } else if (!config.overlays && !L.Util.isArray(config.overlays)) {
      config.overlays = [];
    }

    config.layers = [];

    if (config.baseLayers !== false) {
      config.baseLayers = (function() {
        var visible = false;

        if (config.baseLayers && L.Util.isArray(config.baseLayers) && config.baseLayers.length) {
          for (var i = 0; i < config.baseLayers.length; i++) {
            var baseLayer = config.baseLayers[i];

            if (typeof baseLayer === 'string') {
              var name = baseLayer.split('-');

              baseLayer = config.baseLayers[i] = baselayerPresets[name[0]][name[1]];
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
          var active = baselayerPresets.nps.lightStreets;
          active.visible = true;
          active.zIndex = 0;
          return [active];
        }
      })();
    }

    if (config.overlays && L.Util.isArray(config.overlays) && config.overlays.length) {
      for (var j = 0; j < config.overlays.length; j++) {
        var overlay = config.overlays[j];

        if (typeof overlay === 'string') {
          overlay = config.overlays[j] = overlayPresets[overlay];
        }
      }
    }

    config.center = (function() {
      var c = config.center;

      if (c) {
        return L.latLng(c.lat, c.lng);
      } else {
        return L.latLng(39, -96);
      }
    })();
    config.zoom = typeof config.zoom === 'number' ? config.zoom : 4;

    return config;
  }
});

module.exports = function(config) {
  return new Map(config);
};
