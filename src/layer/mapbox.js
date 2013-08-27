/* global L */

'use strict';

var request = require('../request'),
    url = require('../url'),
    util = require('../util');

var MapBoxLayer = L.TileLayer.extend({
  options: {
    format: 'png',
    opacity: 0.99,
    retinaVersion: null,
    tileJson: null,
    visible: true
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
  initialize: function(config, options) {
    L.TileLayer.prototype.initialize.call(this, undefined, options);

    this._tilejson = {};

    if (options && options.format) {
      util.mapbox.strictOneOf(options.format, this.formats);
    }

    if (options && options.tileJson) {
      this._loadTileJson(options.tileJson);
    } else {
      var id;

      if (L.Browser.retina && options && options.retinaVersion) {
        id = options.tileJson.retinaVersion;
      } else {
        id = config.id;
      }

      this._loadTileJson(id);
    }
  },
  _loadTileJson: function(_) {
    if (typeof _ === 'string') {
      if (_.indexOf('/') === -1) {
        _ = url.mapbox.base() + _ + '.json';
      }

      request(url.mapbox.secureFlag(_), L.bind(function(error, json) {
        if (error) {
          util.log('could not load TileJSON at ' + _);
          this.fire('error', {
            error: error
          });
        } else if (json) {
          this._setTileJson(json);
          this.fire('ready');
        }
      }, this));
    } else if (typeof _ === 'object') {
      this._setTileJson(_);
    }
  },
  _setTileJson: function(json) {
    util.mapbox.strict(json, 'object');

    L.extend(this.options, {
      attribution: json.attribution,
      bounds: json.bounds && util.mapbox.lBounds(json.bounds),
      maxZoom: json.maxzoom,
      minZoom: json.minzoom,
      tiles: json.tiles,
      tms: json.scheme === 'tms'
    });

    this._tilejson = json;
    this.redraw();
    return this;
  },
  _update: function() {
    if (this.options.tiles) {
      L.TileLayer.prototype._update.call(this);
    }
  },
  getTileJson: function() {
    return this._tilejson;
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
    util.mapbox.strict(_, 'string');
    this.options.format = _;
    this.redraw();
    return this;
  },
  setUrl: null
});

module.exports = function(_, options) {
  return new MapBoxLayer(_, options);
};