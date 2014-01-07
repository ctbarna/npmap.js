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
  _backHtml: null,
  _clickResults: null,
  initialize: function(options) {
    var me = this;

    L.Util.setOptions(this, options);
    util.strict(options.tiled, 'boolean');
    util.strict(options.url, 'string');

    if (options.clickable === false) {
      this._hasInteractivity = false;
    }

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

        if (typeof options.edit === 'object' || options.edit === true) {
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
  _back: function() {
    this._map._popup.setContent(this._backHtml).update();
  },
  _boundsToEsri: function(bounds) {
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
  _dataToHtml: function(data) {
    var html;

    if (this.options.popup) {
      switch (typeof this.options.popup) {
      case 'function':
        html = this.options.popup(data.attributes);
        break;
      case 'string':
        html = util.handlebars(this.options.popup, data.attributes);
        break;
      }
    } else {
      html = util._buildAttributeTable(data.value, data.attributes);
    }

    if (typeof this.options.edit === 'object') {
      // TODO: Add edit actions.
      //html = html.slice(0, html.length - 6) + '<div class="actions">Testing</div></div>';
    }

    if (typeof html === 'string') {
      var div = L.DomUtil.create('div', null);
      div.innerHTML = html;
      return div;
    } else {
      return html;
    }
  },
  _handleClick: function(latLng, layer, callback) {
    var me = this;

    me._clickResults = {};
    me.identify(latLng, function(response) {
      if (response) {
        var results = response.results;

        if (results && results.length) {
          var divLayer = L.DomUtil.create('div', 'layer'),
            divTitle = L.DomUtil.create('div', 'title'),
            i = 0,
            ul = L.DomUtil.create('ul', null);

          divTitle.textContent = me.options.name ? me.options.name : results[0].layerName;
          divLayer.appendChild(divTitle);

          for (i; i < results.length; i++) {
            var div = me._dataToHtml(results[i]),
              li = L.DomUtil.create('li', null),
              link = L.DomUtil.create('a', null),
              value = results[i].value;

            for (var j = 0; j < div.childNodes.length; j++) {
              var node = div.childNodes[j];

              if (L.DomUtil.hasClass(node, 'title')) {
                value = node.innerHTML;
                break;
              }
            }

            L.DomEvent.on(link, 'click', function() {
              me._more(this);
            });
            link.textContent = value;
            li.appendChild(link);
            ul.appendChild(li);
            me._clickResults[value] = div;
          }

          divLayer.appendChild(ul);
          callback(layer, divLayer);
        } else {
          callback(layer, null);
        }
      } else {
        callback(layer, null);
      }
    });
  },
  _more: function(el) {
    var actions = L.DomUtil.create('div', 'actions'),
      back = L.DomUtil.create('button', 'btn btn-default'),
      div = L.DomUtil.create('div', null),
      popup = this._map._popup;

    div.appendChild(this._clickResults[el.innerHTML]);
    this._backHtml = popup.getContent();
    L.DomEvent.on(back, 'click', this._back, this);
    back.innerHTML = '« Back to Results';
    actions.appendChild(back);
    div.appendChild(actions);
    popup.setContent(div).update();
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
        mapExtent: json3.stringify(this._boundsToEsri(this._map.getBounds())),
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
