/* global L, document */
/* jslint node: true */
/* jshint camelcase: false */

'use strict';

var UtfGrid = require('../util/utfgrid'),
    reqwest = require('../util/cachedreqwest')().cachedReqwest,
    util = require('../util/util');

var CartoDbLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  _grid: null,
  initialize: function(config) {
    var defaultOptions = {
          domain: 'cartodb.com',
          format: 'png',
          gridFormat: 'grid.json',
          id: (config && config.name) ? config.name : null,
          protocol: document.location.protocol,
          tileDirectory: 'tiles',
          tileXYZ: '{z}/{x}/{y}'
        },
        item;

    for (item in config) {
      this.options[item] = config[item];
    }

    for (item in defaultOptions) {
      this.options[item] = this.options[item] ? this.options[item] : defaultOptions[item];
    }

    util.strict(this.options.name, 'string');
    util.strict(this.options.table, 'string');
    util.strict(this.options.user, 'string');
    this.options.urls = {};
    this.options.urls.root = [this.options.protocol, '//', this.options.user, '.', this.options.domain].join('');
    this.options.urls.rootTile = [this.options.urls.root, '/', this.options.tileDirectory, '/', this.options.table, '/', this.options.tileXYZ].join('');
    this.options.url = [this.options.urls.rootTile, '.', this.options.format].join('');
    this.options.grids = [this.options.urls.rootTile, '.', this.options.gridFormat].join('');
    this.getQuery();
    L.TileLayer.prototype.initialize.call(this, this.options.url, this.options);
    this._grid = new UtfGrid(this, {'crossOrigin': true, 'type': 'jsonp'});
    return this;
  },
  _getGrid: function(latLng, layer, callback) {
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
    this._getGrid(latLng, layer, callback);
  },
  _handleMousemove: function(latLng, layer, callback) {
    this._getGrid(latLng, layer, callback);
  },
  _isQueryable: function(latLng) {
    var returnValue = false,
        url = this._getTileGridUrl(latLng);

    if (this.options.isQueryable) {
      if (this.options.grids) {
        returnValue = this._grid.hasUtfData(url, latLng);
      }
    }

    return returnValue;
  },
  getQuery: function () {
    var me = this;
    // For some reason, this only is supported with https
    me.options.urls.api = [me.options.urls.root.replace('http://', 'https://'), '/', 'api', '/', 'v2', '/', 'sql'].join('');
    var sqlQuery = ['SELECT * FROM ', me.options.table, ' LIMIT 1;'].join(''),
    apiUrl = util.buildUrl(me.options.urls.api, {'q': sqlQuery});

    // Send out the request
    reqwest({
      url: apiUrl,
      type: 'jsonp',
      success: function(response) {
        me.parseApi(response, me);
      }
    });
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
      me.options.isQueryable = true;

      for (var field in response.response.fields) {
        if (response.response.fields[field].type === 'string' || response.response.fields[field].type === 'number') {
          interactivity.push(field);
        }
      }
    } else {
      me.options.isQueryable = false;
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
