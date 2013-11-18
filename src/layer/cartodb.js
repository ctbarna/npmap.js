/* global L, document */
/* jslint node: true */
/* jshint camelcase: false */

'use strict';

var reqwest = require('../util/cachedreqwest')().cachedReqwest,
  utfGrid = require('../util/utfgrid'),
  util = require('../util/util');

var CartoDbLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl,
    format: 'png'
  },
  _getQuery: function() {
    var me = this;

    me.options.urls.api = [me.options.urls.root.replace('http://', 'https://'), '/', 'api', '/', 'v2', '/', 'sql'].join('');

    reqwest({
      success: function(response) {
        me.parseApi(response, me);
      },
      type: 'jsonp',
      url: util.buildUrl(me.options.urls.api, {
        q: ['SELECT * FROM ', me.options.table, ' LIMIT 1;'].join('')
      })
    });
  },
  _getGridData: function(latLng, layer, callback) {
    this._grid.getTileGrid(this._getTileGridUrl(latLng), latLng, function(resultData, gridData) {
      callback(layer, gridData);
    });
  },
  _getTileGridUrl: function(latLng) {
    var params = {
      interactivity: this.options.interactivity,
      sql: this.options.sql
    };

    if (this.options.style) {
      params.style = this.options.style;
    }

    return util.buildUrl(L.Util.template(this.options.grids, this._grid.getTileCoords(latLng)), params);
  },
  _handleClick: function(latLng, layer, callback) {
    this._getGridData(latLng, layer, callback);
  },
  _handleMousemove: function(latLng, layer, callback) {
    this._getGridData(latLng, layer, callback);
  },
  initialize: function(options) {
    L.Util.setOptions(this, options);
    util.strict(this.options.table, 'string');
    util.strict(this.options.user, 'string');

    var root = [document.location.protocol, '//', this.options.user, '.', 'cartodb.com'].join(''),
      rootTile = [root, '/', 'tiles', '/', this.options.table, '/', '{z}/{x}/{y}'].join('');

    this.options.grids = [rootTile, '.', 'grid.json'].join('');
    this.options.url = [rootTile, '.', this.options.format].join('');
    this.options.urls = {
      root: root
    };
    this._getQuery();
    L.TileLayer.prototype.initialize.call(this, this.options.url, this.options);
    this._grid = new utfGrid(this, {
      crossOrigin: true,
      type: 'jsonp'
    });
    return this;
  },
  onAdd: function onAdd(map) {
    L.TileLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function onRemove() {
    L.TileLayer.prototype.onRemove.call(this, this._map);
  },
  parseApi: function(response, me) {
    var interactivity = [],
        sql = [],
        theGeom;

    if (response.response.fields) {
      me._hasInteractivity = true;

      for (var field in response.response.fields) {
        if (response.response.fields[field].type === 'string' || response.response.fields[field].type === 'number') {
          interactivity.push(field);
        }
      }
    } else {
      me._hasInteractivity = false;
    }

    me.options.interactivity = me.options.interactivity ?  me.options.interactivity : interactivity.join(',');
    theGeom = response.response.fields.the_geom_webmercator ? 'the_geom_webmercator' : 'the_geom as the_geom_webmercator';
    sql = ['SELECT ', me.options.interactivity, ',', theGeom, ' FROM ', me.options.table, ';'];
    me.options.sql = me.options.sql ? me.options.sql : sql.join('');
  }
});

module.exports = function(config) {
  return new CartoDbLayer(config);
};
