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

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(attribution);
    }
  },
  _complete: function() {
    // If clustered layer, need to set this._map up. Probably a better way to do this.
    if (!this._map) {
      //this._map = this.getLayers()[0].options.L._map;
      this._map = this.options.L._map;
    }

    this._addAttribution();
    this.fire('ready');
  },
  _removeAttribution: function() {
    var attribution = this.options.attribution;

    if (attribution && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(attribution);
    }
  },
  _toLeaflet: function(config) {
    var configStyles = config.styles || {},
      matchSimpleStyles = {
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
          color: '#000000',
          size: 'medium',
          library: 'maki',
          symbol: null
        },
        properties = feature.properties,
        prop;

      if (!configStyles.ignoreFeatureStyles) {
        for (prop in icon) {
          var value = properties['marker-' + prop];

          if (value) {
            fromFeature[prop] = value;
          }
        }
      }

      if (typeof config.styles === 'undefined') {
        for (prop in fromFeature) {
          icon[prop] = fromFeature[prop];
        }

        icon = L.npmap.icon[icon.library](icon);
      } else {
        var c = typeof config.styles === 'function' ? config.styles(properties).marker : config.styles.marker;

        if (c) {
          c.type = c.type || 'maki';

          if (c.type === 'circle') {
            return new L.CircleMarker(latLng, c);
          } else if (c.leaflet || c.icon) {
            // TODO: c.leaflet is "legacy" (used in PNW Mapper)
            icon = new L.Icon(latLng, c);
          } else {
            for (prop in icon) {
              if (typeof c[prop] === 'string') {
                icon[prop] = util.handlebars(c[prop], properties);
              } else if (typeof c[prop] === 'function') {
                icon[prop] = c[prop](properties);
              }
            }

            for (prop in fromFeature) {
              icon[prop] = fromFeature[prop];
            }

            icon = L.npmap.icon[c.type](icon);
          }
        } else {
          for (prop in fromFeature) {
            icon[prop] = fromFeature[prop];
          }

          icon = L.npmap.icon[icon.library](icon);
        }
      }

      return new L.Marker(latLng, {
        icon: icon
      });
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
          for (prop in matchSimpleStyles) {
            if (typeof properties[prop] !== 'undefined' && properties[prop] !== null && properties[prop] !== '') {
              style[matchSimpleStyles[prop]] = properties[prop];
            }
          }
        }

        if (typeof config.styles !== 'undefined') {
          var c = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

          if (c) {
            for (prop in c) {
              if (typeof style[prop] === 'undefined') {
                style[prop] = c[prop];
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
