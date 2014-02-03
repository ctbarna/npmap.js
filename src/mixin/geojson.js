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
  onAdd: function(map) {
    this._map = map;
    this._addAttribution();
    L.GeoJSON.prototype.onAdd.call(this, map);
  },
  onRemove: function() {
    delete this._map;
    this._removeAttribution();
    L.GeoJSON.prototype.onRemove.call(this);
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
  _toLeaflet: function(config) {
    // TODO: Support preset colors. Setup a "colorProperties" array that contains the name of the properties that can contain colors, then use those to pull in presets.
    // TODO: Support handlebars templates.
    var configStyles,
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
      // TODO: Support L.CircleMarker and L.Icon
      var configStyles,
        icon = {
          'marker-color': '#000000',
          'marker-size': 'medium',
          'marker-library': 'maki',
          'marker-symbol': null
        },
        properties = feature.properties,
        property, value;

      configStyles = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

      if (!configStyles || !configStyles.point) {
        for (property in icon) {
          value = properties[property];

          if (value) {
            icon[property] = value;
          }
        }

        icon = L.npmap.icon[icon['marker-library']](icon);
      } else {
        configStyles = typeof configStyles.point === 'function' ? configStyles.point(properties) : configStyles.point;

        if (configStyles) {
          if (typeof configStyles.iconUrl === 'string') {
            icon = new L.Icon(configStyles);
          } else {
            for (property in icon) {
              value = configStyles[property];

              if (value) {
                icon[property] = value;
              }
            }

            if (!configStyles.ignoreFeatureStyles) {
              for (property in icon) {
                value = properties[property];

                if (value) {
                  icon[property] = value;
                }
              }
            }

            icon = L.npmap.icon[icon['marker-library']](icon);
          }
        } else {
          if (!configStyles.ignoreFeatureStyles) {
            for (property in icon) {
              value = properties[property];

              if (value) {
                icon[property] = value;
              }
            }
          }

          icon = L.npmap.icon[icon['marker-library']](icon);
        }
      }

      return new L.Marker(latLng, L.extend(config, {
        icon: icon
      }));
    };
    config.style = function(feature) {
      var type = (function() {
        var t = feature.geometry.type.toLowerCase();

        if (t.indexOf('line') !== -1) {
          return 'line';
        } else if (t.indexOf('point') !== -1) {
          return 'point';
        } else if (t.indexOf('polygon') !== -1) {
          return 'polygon';
        }
      })();

      if (type !== 'point') {
        // TODO: Add support for passing Leaflet styles in.
        var count = 0,
          properties = feature.properties,
          style = {},
          property;

        for (property in matchSimpleStyles) {
          if (typeof properties[property] !== 'undefined' && properties[property] !== null && properties[property] !== '') {
            style[matchSimpleStyles[property]] = properties[property];
          }
        }

        configStyles = typeof config.styles === 'function' ? config.styles(properties) : config.styles;

        if (configStyles) {
          configStyles = typeof configStyles[type] === 'function' ? configStyles[type](properties) : configStyles[type];

          if (configStyles) {
            for (property in matchSimpleStyles) {
              if (typeof configStyles[property] !== 'undefined' && configStyles[property] !== null && configStyles[property] !== '') {
                style[matchSimpleStyles[property]] = configStyles[property];
              }
            }
          }
        }

        for (property in style) {
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
