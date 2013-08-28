/* global L */

'use strict';

var //m = require('mapbox.js').tileLayer,
    util = require('../util');

//console.log(m);

var MapBoxLayerTest = L.TileLayer.extend({
  options: {
    //errorTileUrl: '',
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
  _loadTileJson: function(_) {
    if (typeof _ === 'string') {
      if (_.indexOf('/') === -1) {
        _ = util.mapbox.url.base() + _ + '.json';
      }

      util.request(util.mapbox.url.secureFlag(_), L.bind(function(error, json) {
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
    util.strict(json, 'object');

    var extend = {
      bounds: json.bounds && util.mapbox.toLeafletBounds(json.bounds),
      tiles: json.tiles,
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
  setUrl: null
});

module.exports = function(config) {
  return new MapBoxLayerTest(config);
};