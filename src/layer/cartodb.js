/* global L */
/* global document */
/* jslint node: true */
/* jshint camelcase: false */

'use strict';

var util = require('../util/util'),
reqwest = require('../util/cachedreqwest')().cachedReqwest,
utfGrid, UtfGrid = require('../util/utfgrid');


var CartoDbLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  initialize: function(config) {

    /* Example config
       {
       'identify': null,
       'name': null,
       'query': null,
       'style': null,
       'table': null,
       'type': null,
       'user': null
       }*/

    // Default values if not otherwise specified
    var defaultOptions = {
      'protocal': document.location.protocol,
      'domain': 'cartodb.com',
      'tileDirectory': 'tiles',
      'tileXYZ': '{z}/{x}/{y}',
      'format': 'png',
      'gridFormat': 'grid.json',
      'id': (config && config.name) ? config.name : null
    },
    item;

    // Assign the defaults
    for (item in defaultOptions) {
      this.options[item] = this.options[item] ? this.options[item] : defaultOptions[item];
    }
    // Read the items from the config
    for (item in config) {
      this.options[item] = config[item];
    }

    util.strict(this.options.name, 'string');
    util.strict(this.options.table, 'string');
    util.strict(this.options.user, 'string');

    this.options.urls = {};
    this.options.urls.root = [this.options.protocal, '//', this.options.user, '.', this.options.domain].join('');
    this.options.urls.rootTile = [this.options.urls.root, '/', this.options.tileDirectory, '/', this.options.table, '/', this.options.tileXYZ].join('');
    this.options.url = [this.options.urls.rootTile, '.', this.options.format].join('');
    this.options.grids = [this.options.urls.rootTile, '.', this.options.gridFormat].join('');

    this.getQuery();

    L.TileLayer.prototype.initialize.call(this, this.options.url, this.options);
    utfGrid = new UtfGrid(this, {'crossOrigin': true, 'type': 'jsonp'});
    return this;
  },
  _getTileGridUrl: function (latLng) {
    var me = this,
    gridTileCoords = utfGrid.getTileCoords(latLng),
    grids = me.options.grids,
    baseUrl = L.Util.template(grids, gridTileCoords),
    params = {'sql': me.options.sql, 'interactivity': me.options.interactivity};
    if (me.options.style) {params.style = me.options.style;}
    return me.buildUrl (baseUrl, params);
  },
  _isQueryable: function(latLng) {
    var returnValue = false,
    me = this,
    url = me._getTileGridUrl(latLng);
    if (me.options.isQueryable) {
      if (me.options.grids) {
        returnValue = utfGrid.hasUtfData(url, latLng);
      }
    }
    return returnValue;
  },
  _handleClick: function(latLng, config, callback) {
    // Handles the click function
    var me = this;

    utfGrid.getTileGrid(me._getTileGridUrl(latLng), latLng, function (resultData, gridData) {
      callback(gridData, config);
    });

  },
  _handleMousemove: function (latLng, callback) {
    // UTFGrid Tiles can be cached on mousemove
    var me = this;
    utfGrid.getTileGrid(me._getTileGridUrl(latLng), latLng, callback);
  },
  onAdd: function onAdd(map) {
    L.TileLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function onRemove() {
    L.TileLayer.prototype.onRemove.call(this, this._map);
  },
  getQuery: function () {
    var me = this;
    // For some reason, this only is supported with https
    me.options.urls.api = [me.options.urls.root.replace('http://', 'https://'), '/', 'api', '/', 'v2', '/', 'sql'].join('');
    var sqlQuery = ['SELECT * FROM ', me.options.table, ' LIMIT 1;'].join(''),
    apiUrl = me.buildUrl(me.options.urls.api, {'q': sqlQuery});

    // Send out the request
    reqwest({
      url: apiUrl,
      type: 'jsonp',
      success: function(response) {
        me.parseApi(response, me);
      }
    });
  },
  parseApi: function (response, me) {
    // Parse out that SQL;
    var interactivity = [], sql=[];
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
    var theGeom = response.response.fields.the_geom_webmercator ? 'the_geom_webmercator' : 'the_geom as the_geom_webmercator';
    sql = ['SELECT ', me.options.interactivity, ',', theGeom, ' FROM ', me.options.table, ';'];
    me.options.sql = me.options.sql ? me.options.sql : sql.join('');
  },
  buildUrl: function (base, params) {
    // This should probably be moved elsewhere
    var returnArray = [];

    if(params) {
      returnArray.push(base + '?');
    } else {
      return base;
    }
    for (var param in params) {
      returnArray.push(encodeURIComponent(param));
      returnArray.push('=');
      returnArray.push(encodeURIComponent(params[param]));
      returnArray.push('&');
    }
    // Remove trailing '&'
    returnArray.pop();

    return returnArray.join('');
  }
});

module.exports = function(config) {
  return new CartoDbLayer(config);
};
