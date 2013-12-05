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
      if (config.maki) {
        var maki;

        switch (typeof config.maki) {
        case 'function':
          maki = config.maki(feature.properties);
          break;
        case 'string':
          // TODO: Support handlebar templates.
          maki = config.maki;
          break;
        default:
          maki = config.maki;
        }

        config.icon = L.npmap.icon.maki(maki);
      } else if (config.npmaki) {
        var npmaki;

        switch (typeof config.maki) {
        case 'function':
          npmaki = config.maki(feature.properties);
          break;
        case 'string':
          // TODO: Support handlebar templates.
          npmaki = config.maki;
          break;
        default:
          npmaki = config.maki;
        }

        config.icon = L.npmap.icon.npmaki(npmaki);
      }

      return L.marker(latLng, config);
    };

    if (typeof config.style === 'string') {
      // TODO: Check to see if it is a handlebars template. If so, parse it.
      var color = colorPresets[config.style];

      config.style = function() {
        return color;
      };
    }

    return config;
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
