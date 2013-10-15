/* global L */
/* global document */
/* jslint node: true */

'use strict';

var util = require('../util/util'),
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
      'gridFormat': 'grid.json'
    },
    item;

    // Assign the defaults
    for (item in defaultOptions) {
      this.options[item] = this.options[item] ? this.options[item] : defaultOptions[item];
    }
    for (item in config) {
      this.options[item] = this.options[item] ? this.options[item] : config[item];
    }

    util.strict(this.options.name, 'string');
    util.strict(this.options.table, 'string');
    util.strict(this.options.user, 'string');

    this.options.rootUrl = [
      this.options.protocal,
      '//',
      this.options.user,
      '.',
      this.options.domain,
      '/',
      this.options.tileDirectory,
      '/',
      this.options.table,
      '/',
      this.options.tileXYZ
    ].join('');
    this.options.url = [
      this.options.rootUrl,
      '.',
      this.options.format
    ].join('');
    this.options.grids = [
      this.options.rootUrl,
      '.',
      this.options.gridFormat
    ].join('');

    L.TileLayer.prototype.initialize.call(this, this.options.url, this.options);
    utfGrid = new UtfGrid(this);
    return this;
  },
  _getTileGridUrl: function (latLng) {
    var me = this,
    gridTileCoords = utfGrid.getTileCoords(latLng),
    grids = me.options.grids;
    return L.Util.template(grids, gridTileCoords) + '?sql=' + 'SELECT online,park,station_na,data_start,data_end,datewprese,station_id,network,lat,long,elevm,in_park,state,county,hcnm_num,gov_admin,note,for_data,icon,url,_order,field_22,the_geom,cartodb_id,created_at,updated_at,the_geom_webmercator,ST_ASGEOJSON(the_geom) as geometry FROM scpn_weather_stations&interactivity=online,park,station_na,data_start,data_end,datewprese,station_id,network,lat,long,elevm,in_park,state,county,hcnm_num,gov_admin,note,for_data,icon,url,_order,field_22,the_geom,cartodb_id,created_at,updated_at,the_geom_webmercator,geometry';
  },
  _isQueryable: function(latLng) {
    var returnValue = false,
    me = this,
    url = me._getTileGridUrl(latLng);
    if (me.options.grids) {
      returnValue = utfGrid.hasUtfData(url, latLng);
    }
    return returnValue;
  },
  _handleClick: function(latLng, config, callback) {
    // Handles the click function
    var me = this;
    utfGrid.getTileGrid(me._getTileGridUrl(latLng), latLng, function (resultData) {
      callback(resultData, config);
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
  }
});

module.exports = function(config) {
  return new CartoDbLayer(config);
};
