/* global L, document */
/* jshint camelcase: false */

'use strict';

var json3 = require('json3'),
  reqwest = require('reqwest'),
  utfGrid = require('../util/utfgrid'),
  util = require('../util/util');

var CartoDbLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl,
    format: 'png',
    subdomains: [
      0,
      1,
      2,
      3
    ]
  },
  // Leaflet overrides
  initialize: function(options) {
    L.Util.setOptions(this, options);
    util.strict(this.options.table, 'string');
    util.strict(this.options.user, 'string');
    L.TileLayer.prototype.initialize.call(this, undefined, this.options);
    this._build();
  },
  _update: function() {
    if (this._urlTile) {
      L.TileLayer.prototype._update.call(this);
    }
  },
  // NPMap.js methods
  _build: function() {
    var me = this;

    this._urlApi = 'https://' + this.options.user + '.cartodb.com/api/v2/sql';
    reqwest({
      success: function(response) {
        var cartocss = '#layer{line-color:#d39800;line-opacity:0.8;line-width:3;marker-fill:#d39800;marker-height:8;polygon-fill:#d39800;polygon-opacity:0.2;}';

        me._hasInteractivity = false;
        me._interactivity = null;

        if (me.options.interactivity) {
          me._interactivity = me.options.interactivity.split(',');
        } else if (me.options.clickable !== false && response.fields) {
          me._interactivity = [];

          for (var field in response.fields) {
            if (response.fields[field].type !== 'geometry') {
              me._interactivity.push(field);
            }
          }

          if (me._interactivity.length) {
            me._hasInteractivity = true;
          }
        }

        if (me.options.cartocss) {
          cartocss = me.options.cartocss;
        } else if (me.options.styles) {
          cartocss = me._simpleStyleToCartoCss(me.options.styles);
        }

        me._cartocss = cartocss;
        me._sql = (me.options.sql || ('SELECT * FROM ' + me.options.table + ';'));

        reqwest({
          success: function(response) {
            var root = 'http://{s}.api.cartocdn.com/' + me.options.user + '/tiles/layergroup/' + response.layergroupid,
              template = '{z}/{x}/{y}';

            if (me._hasInteractivity && me._interactivity.length) {
              me._urlGrid = root + '/0/' + template + '.grid.json';
              me._grid = new utfGrid(me);
            }

            me._urlTile = root + '/' + template + '.png';
            me.setUrl(me._urlTile);
            me.redraw();
            return me;
          },
          type: 'jsonp',
          url: util.buildUrl('http://' + me.options.user + '.cartodb.com/tiles/layergroup', {
            config: json3.stringify({
              layers: [{
                options: {
                  cartocss: me._cartocss,
                  cartocss_version: '2.1.0',
                  interactivity: me._interactivity,
                  sql: me._sql
                },
                stat_tag: 'API',
                type: 'cartodb'
              }],
              version: '1.0.0'
            })
          })
        });
      },
      type: 'jsonp',
      url: util.buildUrl(this._urlApi, {
        q: 'select * from ' + this.options.table + ' limit 1;'
      })
    });
  },
  _getGridData: function(latLng, layer, callback) {
    if (this._urlGrid) {
      this._grid.getTileGrid(L.Util.template(this._urlGrid, L.Util.extend({
        s: this.options.subdomains[Math.floor(Math.random() * this.options.subdomains.length)]
      }, this._grid.getTileCoords(latLng))), latLng, function(resultData, gridData) {
        callback(layer, gridData);
      });
    } else {
      callback(layer, null);
    }
  },
  _handleClick: function(latLng, layer, callback) {
    this._getGridData(latLng, layer, callback);
  },
  _handleMousemove: function(latLng, layer, callback) {
    this._getGridData(latLng, layer, callback);
  },
  _simpleStyleToCartoCss: function(styles) {
    var obj = {};

    for (var prop in styles) {
      var value = styles[prop];

      switch (prop) {
      case 'fill':
        obj['polygon-fill'] = value;
        break;
      case 'fill-opacity':
        obj['polygon-opacity'] = value;
        break;
      case 'marker-color':
        obj['marker-fill'] = value;
        break;
      case 'marker-size':
        var size = (function() {
          if (value === 'large') {
            return 16;
          } else if (value === 'medium') {
            return 12;
          } else {
            return 8;
          }
        })();

        obj['marker-height'] = size;
        obj['marker-width'] = size;
        break;
      case 'marker-symbol':
        break;
      case 'stroke':
        obj['line-color'] = value;
        break;
      case 'stroke-opacity':
        obj['line-opacity'] = value;
        break;
      case 'stroke-width':
        obj['line-width'] = value;
        break;
      }
    }

    return '#layer{' + json3.stringify(obj) + '}';
  },
  setCartoCss: function(cartoCss) {

  },
  setInteractivity: function(interactivity) {

  },
  setSql: function(sql) {

  }
});

module.exports = function(config) {
  return new CartoDbLayer(config);
};
