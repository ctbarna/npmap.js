/* global L */

'use strict';

var colorPresets = require('../preset/colors.json'),
  topojson = require('../util/topojson'),
  util = require('../util/util');

module.exports = {
  _addAttribution: function() {
    if (this.options.attribution && this._map.attributionControl) {
      this._map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  _removeAttribution: function() {
    if (this.options.attribution && this._map.attributionControl) {
      this._map.attributionControl.removeAttribution(this.options.attribution);
    }
  },
  _toLeaflet: function(config) {
    var styles = {
      fill: '',
      'fill-opacity': '',
      stroke: '',
      'stroke-opacity': '',
      'stroke-width': ''
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
      // Check for 'marker-color', 'marker-library', 'marker-size', and 'marker-symbol' properties in feature first.
      // If they don't exist, check for "marker" object in the config. (color, library, size, symbol, url (check this first))
      // If those don't exist, use defaults.
      var fromFeature = {},
        icon = {
          color: '#000',
          library: 'maki',
          size: 'medium',
          symbol: null
        },
        properties = feature.properties,
        prop;

      for (prop in icon) {
        if (typeof properties['marker-' + prop] !== 'undefined') {
          fromFeature[prop] = properties['marker-' + prop];
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
          // If iconUrl is set, it currently overrides *everything*.
          if (typeof c.iconUrl === 'string') {
            config.icon = new L.Icon(c);
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

    // These styles can be sent in as strings or functions at the config level
    // They can also be set, per geometry, in the data source.

    //fill
    //fill-opacity
    //marker-color
    //marker-library: "npmaki" (default), "maki"
    //marker-size
    //marker-symbol
    //stroke
    //stroke-opacity
    //stroke-width

    /*
    if (typeof config.style === 'string') {
      // TODO: Check to see if it is a handlebars template. If so, parse it.
      var color = colorPresets[config.style];

      config.style = function() {
        return color;
      };
    }
    */

    return config;
  },
  _complete: function() {
    this.fire('ready');
  },
  addData: function(feature) {
    if (/\btopology\b/i.test(feature.type)) {
      for (var prop in feature.objects) {
        L.GeoJSON.prototype.addData.call(this, topojson.feature(feature, feature.objects[prop]));
      }
    } else {
      L.GeoJSON.prototype.addData.call(this, feature);
    }
  }
};
