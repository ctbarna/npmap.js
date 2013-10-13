/* global L */
/* global console */
/* global document */
/*jslint node: true */

'use strict';

var reqwest = require('reqwest'),
    util = require('../util/util'),
    tileMath = require('../util/tileMath.js');

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
  cachedTiles: function () {
    var tiles = [],
      urls = [];

    var getTileIndex = function(url) {
      for (var urlIndex in urls) {
        if (urls[urlIndex] === url) {
          return urlIndex;
        }
      }
      return -1;
    };

    var addTile = function(url, tile) {
      var t =tiles.push(tile),
        u = urls.push(url);

      if (t===u) {
        return t;
      }
      return null;
    };

    return {
      'has': function(url) {
        return getTileIndex(url) >= 0;
      },
      'tile': function(url) {
        if (this.has(url)) {
          return tiles[getTileIndex(url)];
        }
        return null;
      } ,
      'addTile': addTile
    };
  }(),
  _toLeafletBounds: function(_) {
    return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
  },
  _getTileGridPoint: function _getTileGridPoint(latLng,result) {

    // Forked from danzel/Leaflet.utfgrid
    // https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js
    var me = this,
      point = me._map.project(latLng),
      tileSize = me.options.tileSize || 256,
      resolution = me.options.resolution || 4,
      x = Math.floor(point.x / tileSize),
      y = Math.floor(point.y / tileSize),
      max = me._map.options.crs.scale(me._map.getZoom()) / tileSize;

    x = (x + max) % max;
    y = (y + max) % max;

    var gridX = Math.floor((point.x - (x * tileSize))/ resolution),
        gridY = Math.floor((point.y - (y * tileSize)) / resolution),
        key = result.grid[gridY].charCodeAt(gridX);

    // Return the data from the key
    return result.data[result.keys[me._utfDecode(key)]];
  },
  _getTileGrid: function _getTileGrid(latLng, callback) {
    var me = this,
    gridPoint = {
      x: tileMath.long2tile(latLng.lng, me._map.getZoom()),
      y: tileMath.lat2tile(latLng.lat, me._map.getZoom()),
      z: me._map.getZoom()
    },
    grids = me.options.grids,
    tileUrl;
    if (this._isQueryable(latLng)) {
      tileUrl = L.Util.template(grids[Math.floor(Math.abs(gridPoint.x + gridPoint.y) % grids.length)], gridPoint);

      // Check the cache for this particular tile
      if (me.cachedTiles.has(tileUrl)) {
        // Return it if we have it
        callback(me.cachedTiles.tile(tileUrl));
      } else {
        // Go get it
        reqwest({
          url: tileUrl,
          type: 'jsonp',
          success: function (res) {
            callback(res);
            me.cachedTiles.addTile(tileUrl, res);
          },
          error: function (err) {
            callback(err);
          }
        });
      }
    } else {
      // Tile is not within range
      callback(null);
    }
  },
  _isQueryable: function(latLng) {
      return this.options.grids && this.options.bounds.contains(latLng);
  },
  _handleClick: function(latLng, config, callback) {
    // Handles the click function
    var me = this;

    me._getTileGrid(latLng, function drawPopup(resultData) {
      callback(me._getTileGridPoint(latLng, resultData), config);
    });
  },
  _handleMouseOver: function (e, config, callback) {
    // UTFGrid Tiles can be cached on mouseover
    var latLng = e.latLng,
      me = this;

      me._getTileGrid(latLng, null);
  },
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

    this._loadTileJson(_);
  },
  onAdd: function onAdd(map) {
    L.TileLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function onRemove() {
    L.TileLayer.prototype.onRemove.call(this, this._map);
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
  _update: function() {
    if (this.options.tiles) {
      L.TileLayer.prototype._update.call(this);
    }
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
  setFormat: function(_) {
    util.strict(_, 'string');
    this.options.format = _;
    this.redraw();
    return this;
  },
  setUrl: null,
  _utfDecode: function _utfDecode(key) {
    // https://github.com/danzel/Leaflet.utfgrid/blob/master/src/leaflet.utfgrid.js
    if (key >= 93) key--;
    if (key >= 35) key--;
    return key - 32;
  }
});

module.exports = function(config) {
  return new MapBoxLayer(config);
};
