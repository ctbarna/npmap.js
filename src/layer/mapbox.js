/* global document, L */
/* jslint node: true */

'use strict';

var reqwest = require('reqwest'),
    utfGrid = require('../util/utfgrid'),
    util = require('../util/util');

var MapBoxLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl,
    format: 'png',
    subdomains: [
      'a',
      'b',
      'c',
      'd'
    ]
  },
  _grid: null,
  formats: [
    'jpg70',
    'jpg80',
    'jpg90',
    'png',
    'png32',
    'png64',
    'png128',
    'png256'
  ],
  initialize: function(config) {
    var _;

    // Overwrites this.options with options passed in via config.
    L.TileLayer.prototype.initialize.call(this, undefined, config);

    if (config.format) {
      util.strictOneOf(config.format, this.formats);
    }

    if (L.Browser.retina && config.retinaVersion) {
      if (typeof config.detectRetina === 'undefined' || config.detectRetina === true) {
        config.detectRetina = true;
        _ = config.retinaVersion;
      }
    } else {
      config.detectRetina = false;
      _ = config.tileJson || config.id;
    }

    this._grid = new utfGrid(this);
    this._loadTileJson(_);
  },
  _getGrid: function(latLng, layer, callback) {
    this._grid.getTileGrid(this._getTileGridUrl(latLng), latLng, function(resultData, gridData) {
      callback(layer, gridData);
    });
  },
  _getTileGridUrl: function(latLng) {
    var grids = this.options.grids,
        gridTileCoords = this._grid.getTileCoords(latLng);

    return L.Util.template(grids[Math.floor(Math.abs(gridTileCoords.x + gridTileCoords.y) % grids.length)], gridTileCoords);
  },
  _handleClick: function(latLng, layer, callback) {
    this._getGrid(latLng, layer, callback);
  },
  _handleMousemove: function (latLng, layer, callback) {
    this._getGrid(latLng, layer, callback);
  },
  _isQueryable: function(latLng) {
    var returnValue = false;

    if (this.options.grids && this.options.bounds.contains(latLng)) {
      returnValue = this._grid.hasUtfData(this._getTileGridUrl(latLng), latLng);
    }

    return returnValue;
  },
  _loadTileJson: function(_) {
    if (typeof _ === 'string') {
      var me = this;

      if (_.indexOf('/') === -1) {
        _ = (function(hash) {
          var urls = (function() {
            var endpoints = [
              'a.tiles.mapbox.com/v3/',
              'b.tiles.mapbox.com/v3/',
              'c.tiles.mapbox.com/v3/',
              'd.tiles.mapbox.com/v3/'
            ];

            for (var i = 0; i < endpoints.length; i++) {
              endpoints[i] = [document.location.protocol, '//', endpoints[i]].join('');
            }

            return endpoints;
          })();

          if (hash === undefined || typeof hash !== 'number') {
            return urls[0];
          } else {
            return urls[hash % urls.length];
          }
        })() + _ + '.json';
      }

      // TODO: Need to return errors from reqwest.
      reqwest({
        jsonpCallbackName: 'grid',
        success: L.bind(function(json, error) {
          if (error) {
            util.log('could not load TileJSON at ' + _);
            me.fire('error', {
              error: error
            });
          } else if (json) {
            me._setTileJson(json);
            me.fire('ready');
          }
        }),
        type: 'jsonp',
        url: (function(url) {
          if ('https:' !== document.location.protocol) {
            return url;
          } else if (url.match(/(\?|&)secure/)) {
            return url;
          } else if (url.indexOf('?') !== -1) {
            return url + '&secure';
          } else {
            return url + '?secure';
          }
        })(_)
      });
    } else if (typeof _ === 'object') {
      this._setTileJson(_);
    }
  },
  _setTileJson: function(json) {
    util.strict(json, 'object');

    var extend = {
      bounds: json.bounds && this._toLeafletBounds(json.bounds),
      tiles: json.tiles,
      grids: json.grids,
      tms: json.scheme === 'tms'
    };

    if (typeof this.options.attribution === 'undefined') {
      extend.attribution = json.attribution;
    }

    if (typeof this.options.maxZoom === 'undefined') {
      extend.maxZoom = json.maxzoom;
    }

    if (typeof this.options.minZoom === 'undefined') {
      extend.minZoom = json.minzoom;
    }

    L.extend(this.options, extend);

    this.tileJson = json;
    this.redraw();
    return this;
  },
  _toLeafletBounds: function(_) {
    return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
  },
  _update: function() {
    if (this.options.tiles) {
      L.TileLayer.prototype._update.call(this);
    }
  },
  _utfDecode: function _utfDecode(key) {
    // https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js
    if (key >= 93) key--;
    if (key >= 35) key--;
    return key - 32;
  },
  getTileUrl: function(tilePoint) {
    var tiles = this.options.tiles,
    templated = L.Util.template(tiles[Math.floor(Math.abs(tilePoint.x + tilePoint.y) % tiles.length)], tilePoint);

    if (templated) {
      return templated.replace('.png', '.' + this.options.format);
    } else {
      return templated;
    }
  },
  onAdd: function onAdd(map) {
    L.TileLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function onRemove() {
    L.TileLayer.prototype.onRemove.call(this, this._map);
  },
  setFormat: function(_) {
    util.strict(_, 'string');
    this.options.format = _;
    this.redraw();
    return this;
  },
  setUrl: null
});

module.exports = function(config) {
  return new MapBoxLayer(config);
};
