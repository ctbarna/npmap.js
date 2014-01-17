/* global L */

'use strict';

var topojson = require('../util/topojson'),
  util = require('../util/util');

module.exports = {
  addData: function(feature) {
    if (/\btopology\b/i.test(feature.type)) {
      for (var prop in feature.objects) {
        L.GeoJSON.prototype.addData.call(this, topojson.feature(feature, feature.objects[prop]));
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, feature);
    }
  },
  _addAttribution: function() {
    var attribution = this.options.attribution;

    if (attribution && this._map && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(attribution);
    }
  },
  _complete: function() {
    // If clustered layer, need to set this._map up. Probably a better way to do this.
    if (!this._map) {
      this._map = this.getLayers()[0].options.L._map;
    }

    this._addAttribution();
    this.fire('ready');
  },
  _removeAttribution: function() {
    var attribution = this.options.attribution;

    if (attribution && this._map && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(attribution);
    }
  },
  _toLeaflet: function(config) {
    var configStyles = config.styles || {},
      match = {
        'fill': 'fillColor',
        'fill-opacity': 'fillOpacity',
        'stroke': 'color',
        'stroke-opacity': 'opacity',
        'stroke-width': 'weight'
      };

    if (typeof config.clickable === 'undefined' || config.clickable === true) {
      var activeTip, lastTarget;

      config.onEachFeature = function(feature, layer) {
        layer.on('click', function(e) {
          var properties = feature.properties,
            html = util.dataToHtml(config, properties),
            target = e.target,
            popup = L.popup({
              autoPanPaddingTopLeft: util._getAutoPanPaddingTopLeft(target._map.getContainer())
            });

          if (lastTarget) {
            lastTarget.closePopup().unbindPopup();
            lastTarget = target;
          }

          if (html) {
            if (feature.geometry.type === 'Point') {
              popup.setContent(html);
              target.bindPopup(popup).openPopup();
              lastTarget = target;
            } else {
              popup.setContent(html).setLatLng(e.latlng.wrap()).openOn(target._map);
            }
          }
        });
        layer.on('mouseout', function(e) {
          if (activeTip) {
            var tooltips = e.target._map._tooltips;

            tooltips.splice(tooltips.indexOf(activeTip), 1);
          }
        });
        layer.on('mouseover', function(e) {
          var tooltipConfig = config.tooltip;

          if (tooltipConfig) {
            var properties = feature.properties,
              tip;

            if (typeof tooltipConfig === 'function') {
              tip = tooltipConfig(properties);
            } else if (typeof tooltipConfig === 'string') {
              tip = util.handlebars(tooltipConfig, properties);
            }

            if (tip) {
              e.target._map._tooltips.push(tip);
              activeTip = tip;
            }
          }
        });
      };
    }

    config.pointToLayer = function(feature, latLng) {
      // TODO: Support preset colors.
      // TODO: Support handlebars templates.
      var fromFeature = {},
        icon = {
          color: '#000',
          library: 'maki',
          size: 'medium',
          symbol: null
        },
        properties = feature.properties,
        prop;

      if (!configStyles.ignoreFeatureStyles) {
        for (prop in icon) {
          var a = properties['marker-' + prop];

          if (typeof a !== 'undefined' && a !== null && a.length) {
            fromFeature[prop] = properties['marker-' + prop];
          }
        }
      }

      if (typeof config.styles === 'undefined') {
        for (prop in fromFeature) {
          icon[prop] = fromFeature[prop];
        }

        config.icon = L.npmap.icon[icon.library](icon);
      } else {
        var c = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

        if (c) {
          if (c.leaflet === true) {
            for (prop in fromFeature) {
              icon[prop] = fromFeature[prop];
            }

            for (prop in c) {
              if (prop !== 'leaflet' && typeof fromFeature[prop] === 'undefined') {
                icon[prop] = c[prop];
              }
            }

            config.icon = new L.Icon(icon);
          } else {
            for (prop in icon) {
              if (typeof c['marker-' + prop] === 'string') {
                icon[prop] = util.handlebars(c['marker-' + prop], properties);
              } else if (typeof c['marker-' + prop] === 'function') {
                icon[prop] = c['marker-' + prop](properties);
              }
            }

            for (prop in fromFeature) {
              icon[prop] = fromFeature[prop];
            }

            config.icon = L.npmap.icon[icon.library](icon);
          }
        } else {
          for (prop in fromFeature) {
            icon[prop] = fromFeature[prop];
          }

          config.icon = L.npmap.icon[icon.library](icon);
        }
      }

      return L.marker(latLng, config);
    };
    config.style = function(feature) {
      // TODO: Support preset colors.
      // TODO: Support handlebars templates.
      if (feature.geometry.type !== 'Point') {
        var count = 0,
          properties = feature.properties,
          style = {},
          prop;

        if (!configStyles.ignoreFeatureStyles) {
          for (prop in match) {
            if (typeof properties[prop] !== 'undefined' && properties[prop] !== '') {
              style[match[prop]] = properties[prop];
            }
          }
        }

        if (typeof config.styles !== 'undefined') {
          var c = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

          if (c) {
            if (c.leaflet === true) {
              for (prop in c) {
                if (prop !== 'leaflet' && typeof style[prop] === 'undefined') {
                  style[prop] = c[prop];
                }
              }
            } else {
              if (typeof c === 'object') {
                for (prop in match) {
                  if (typeof c[prop] !== 'undefined' && c[prop] !== '' && typeof style[match[prop]] === 'undefined') {
                    style[match[prop]] = c[prop];
                  }
                }
              } else if (typeof c === 'string') {

              }
            }
          }
        }

        for (prop in style) {
          count++;
          break;
        }

        if (count) {
          return style;
        }
      }
    };

    return config;
  }
};
