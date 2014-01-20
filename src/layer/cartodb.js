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
  _build: function() {
    var me = this;

    this._urlApi = 'https://' + this.options.user + '.cartodb.com/api/v2/sql';
    reqwest({
      success: function(response) {
        var interactiveFields = [];

        if (me.options.clickable !== false && response.fields) {
          for (var field in response.fields) {
            var type = response.fields[field].type;

            if (type === 'date' || type === 'number' || type === 'string') {
              interactiveFields.push(field);
            }
          }

          if (interactiveFields.length) {
            me._hasInteractivity = true;
            me._interactivity = interactiveFields.join(',');
          } else {
            me._hasInteractivity = false;
            me._interactivity = null;
          }
        } else {
          me._hasInteractivity = false;
          me._interactivity = null;
        }

        me._cartocss = '#layer{polygon-fill:#F00;polygon-opacity:0.3;line-color:#F00;}';
        me._sql = ('SELECT ' + (me._interactivity ? me._interactivity : '') + ',' + (response.fields.the_geom_webmercator ? 'the_geom_webmercator' : 'the_geom as the_geom_webmercator') + ' FROM ' + me.options.table + ';');

        reqwest({
          success: function(response) {
            var root = 'http://{s}.api.cartocdn.com/' + me.options.user + '/tiles/layergroup/' + response.layergroupid + '/{z}/{x}/{y}';

            if (me._hasInteractivity) {
              //me._urlGrid = root + '.grid.json';
              me._urlGrid = 'http://' + me.options.user + '.cartodb.com/tiles/' + me.options.table + '/{z}/{x}/{y}.grid.json';
              me._grid = new utfGrid(me, {
                crossOrigin: true,
                type: 'jsonp'
              });
            }
            
            me._urlTile = root + '.png';
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
                  interactivity: me._interactivity ? me._interactivity : null,
                  sql: me._sql
                },
                type: 'cartodb'
              }],
              version: '1.0.0'
            })
          })
        });
      },
      type: 'jsonp',
      url: util.buildUrl(this._urlApi, {
        q: 'SELECT * FROM ' + this.options.table + ' LIMIT 1;'
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
  }
});

module.exports = function(config) {
  return new CartoDbLayer(config);
};
