/* global L */

'use strict';

var json3 = require('json3'),
  reqwest = require('reqwest'),
  util = require('../util/util');

var ArcGisServerLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  statics: {
    TILED_TEMPLATE: '{{url}}/tile/{z}/{y}/{x}'
  },
  initialize: function(options) {
    var me = this;

    options = L.setOptions(this, options);

    util.strict(options.tiled, 'boolean');
    util.strict(options.url, 'string');

    if (typeof options.layers !== 'string') {
      options.layers = '';
    }

    if (options.tiled) {
      var u;

      if (options.url.indexOf('{s}') === -1 && options.url.indexOf('://tiles.arcgis.com')) {
        options.subdomains = [
          '1',
          '2',
          '3',
          '4'
        ];
        u = options.url.replace('://tiles.arcgis.com', '://tiles{s}.arcgis.com');
      } else {
        u = options.url;
      }

      L.TileLayer.prototype.initialize.call(this, ArcGisServerLayer.TILED_TEMPLATE.replace('{{url}}', u), options);
    } else {
      this.getTileUrl = function(tilePoint) {
        var hW = 256,
          x = tilePoint.x,
          y = tilePoint.y,
          z = tilePoint.z,
          u = options.url + '/export?transparent=true&f=image&format=png24&bbox=' + ((x * hW) * 360 / (hW * Math.pow(2, z)) - 180) + ',' + (Math.asin((Math.exp((0.5 - ((y + 1) * hW) / (hW) / Math.pow(2, z)) * 4 * Math.PI) - 1) / (Math.exp((0.5 - ((y + 1) * hW) / 256 / Math.pow(2, z)) * 4 * Math.PI) + 1)) * 180 / Math.PI) + ',' + (((x + 1) * hW) * 360 / (hW * Math.pow(2, z)) - 180) + ',' + (Math.asin((Math.exp((0.5 - (y * hW) / (hW) / Math.pow(2, z)) * 4 * Math.PI) - 1) / (Math.exp((0.5 - (y * hW) / 256 / Math.pow(2, z)) * 4 * Math.PI) + 1)) * 180 / Math.PI) + '&bboxSR=4326&imageSR=4326&size=' + hW + ',' + hW;

        if (typeof options.editable === 'object' || options.editable === true) {
          u += '&nocache=' + new Date().getTime();
        }

        if (typeof options.layers === 'string' && options.layers.length) {
          u += '&layers=show:' + options.layers;
        }

        return u;
      };
      L.TileLayer.prototype.initialize.call(this, undefined, options);
    }

    reqwest({
      success: function(response) {
        var capabilities = response.capabilities;

        if (typeof capabilities === 'string') {
          if (capabilities.toLowerCase().indexOf('query') === -1) {
            me._hasInteractivity = false;
          }
        }

        me._metadata = response;
        me.fire('metadata', response);
      },
      type: 'jsonp',
      url: options.url + '?f=json'
    });

    return this;
  },
  onAdd: function(map) {
    this._map = map;

    if (this.options.dynamicAttribution && this.options.dynamicAttribution.indexOf('http://') === 0) {
      var me = this;

      reqwest({
        success: function(response) {
          me._dynamicAttributionData = response.contributors;
          me._map.on('viewreset zoomend dragend', me._updateAttribution, me);
          me.on('load', me._updateAttribution, me);
        },
        type: 'jsonp',
        url: this.options.dynamicAttribution
      });
    }

    L.TileLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function(map) {
    if (this._dynamicAttributionData) {
      this.off('load', this._updateAttribution);
      this._map.off('viewreset zoomend dragend', this._updateAttribution);
    }

    L.TileLayer.prototype.onRemove.call(this, map);
  },
  _dataToHtml: function(data) {
    // TODO: Also need to display the name of the layer, if defined.
    return  util._buildAttributeTable(data.layerName, data.attributes);
  },
  _handleClick: function(latLng, layer, callback) {
    var me = this;

    me.identify(latLng, function(response) {
      if (response) {
        var results = response.results;

        if (results && results.length) {
          var i = 0,
            html = '';

          if (me.options.popup) {
            switch (typeof me.options.popup) {
            case 'function':
              for (i = 0; i < results.length; i++) {
                html += me.options.popup(results[i].attributes);
              }

              break;
            case 'string':
              for (i = 0; i < results.length; i++) {
                html += util.handlebars(me.options.popup, results[i].attributes);
              }

              break;
            }
          } else {
            for (i = 0; i < results.length; i++) {
              html += me._dataToHtml(results[i]);
            }
          }

          callback(layer, html);
        } else {
          callback(layer, null);
        }
      } else {
        callback(layer, null);
      }
    });
  },
  _toEsriBounds: function(bounds) {
    return {
      spatalReference: {
        wkid: 4326
      },
      xmax: bounds.getNorthEast().lng,
      ymax: bounds.getNorthEast().lat,
      xmin: bounds.getSouthWest().lng,
      ymin: bounds.getSouthWest().lat
    };
  },
  _updateAttribution: function() {
    var map = this._map,
      bounds = map.getBounds(),
      include = [],
      zoom = map.getZoom();

    if (this.options.attribution) {
      this._map.attributionControl.removeAttribution(this.options.attribution);
    }

    for (var i = 0; i < this._dynamicAttributionData.length; i++) {
      var contributor = this._dynamicAttributionData[i];

      for (var j = 0; j < contributor.coverageAreas.length; j++) {
        var coverageArea = contributor.coverageAreas[j],
          coverageBounds = coverageArea.bbox;

        if (zoom >= coverageArea.zoomMin && zoom <= coverageArea.zoomMax) {
          if (bounds.intersects(L.latLngBounds(L.latLng(coverageBounds[0], coverageBounds[3]), L.latLng(coverageBounds[2], coverageBounds[1])))) {
            include.push(contributor.attribution);
            break;
          }
        }
      }
    }

    if (include.length) {
      this.options.attribution = include.join(', ');
      map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  identify: function(latLng, callback) {
    var container = this._map.getContainer(),
      params = {
        f: 'json',
        geometry: json3.stringify({
          spatialReference: {
            wkid: 4326
          },
          x: latLng.lng,
          y: latLng.lat
        }),
        geometryType: 'esriGeometryPoint',
        imageDisplay: container.offsetWidth + ',' + container.offsetHeight + ',96',
        layers: 'visible',
        mapExtent: json3.stringify(this._toEsriBounds(this._map.getBounds())),
        returnGeometry: false,
        sr: 4326,
        tolerance: 3
      };

    if (typeof this.options.layers === 'string' && this.options.layers.length) {
      this.options.layers += ':' + this.options.layers;
    }

    reqwest({
      data: params,
      success: function(response) {
        if (callback) {
          callback(response);
        }
      },
      type: 'jsonp',
      url: this.options.url + '/identify'
    });
  }
});

module.exports = function(options) {
  return new ArcGisServerLayer(options);
};
