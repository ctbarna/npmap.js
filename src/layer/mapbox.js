/* global L */

'use strict';

var reqwest = require('reqwest'),
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
  _toLeafletBounds: function(_) {
    return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
  },
  _handleClick: function(e) {
    var latLng = e.latlng,
    me = this;

    me._popup = L.popup({
      maxHeight: (me._map.getContainer().offsetHeight - 86),
      maxWidth: (me._map.getContainer().offsetWidth - 95),
      minWidth: 221
    });

    var getMapboxData = function getMapboxData(latLng, callback) {
      callback({
        'Example Layer1': ['Data 1', 'Data 2', 'Data 3'],
        'Example Layer2': ['Test Data', 'Junk Data'],
        'Example Layer3': ['Example Data', 'Sample Data', 'Junk Data', 'Gibberish']
      });
    };

    // Create the HTML for the popup
    var createPopup = function createPopup(layerResults){
      var popupDiv = document.createElement('div');
      for (var layerName in layerResults) {
        var results = layerResults[layerName];

        var theseResults = document.createElement('div');
        var layerTitle = document.createElement('div');
        layerTitle.setAttribute('class', 'title');
        layerTitle.setAttribute('style', 'margin-top:10px;');
        layerTitle.textContent = [layerName, ' (', results.length, ')'].join('');

        var resultsTable = document.createElement('table');
        var resultsTableBody = document.createElement('tbody');

        for (var value in results) {
          var tableRow = document.createElement('tr');
          tableRow.setAttribute('class', 'hoverable');
          var tableData = document.createElement('td');
          tableData.textContent = value;
          tableRow.appendChild(tableData);
          resultsTableBody.appendChild(tableRow);
        }
        resultsTable.appendChild(resultsTableBody);
        theseResults.appendChild(layerTitle);
        theseResults.appendChild(resultsTable);
        popupDiv.appendChild(theseResults);
      }
      return popupDiv.outerHTML;
    };

    getMapboxData(latLng, function drawPopup(resultData) {
      me._popup.setContent(createPopup(resultData)).setLatLng(latLng).openOn(me._map);
    });
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
    // TODO: Filter out if zIndex === 0.
    if ((typeof this.options.popup === 'undefined' || this.options.popup !== false)) {
      this._isIdentifiable = true;
      map.on('click', this._handleClick, this);

    } else {
      this._isIdentifiable = false;
    }

    L.TileLayer.prototype.onAdd.call(this, map);
  },
  onRemove: function onRemove() {
    this._map
      .off('click', this._handleClick, this);
  },
  _loadTileJson: function(_) {
    if (typeof _ === 'string') {
      var me = this;

      if (_.indexOf('/') === -1) {
        _ = (function(hash) {
          var urls = (function() {
            var endpoints = [
              'http://a.tiles.mapbox.com/v3/',
              'http://b.tiles.mapbox.com/v3/',
              'http://c.tiles.mapbox.com/v3/',
              'http://d.tiles.mapbox.com/v3/'
            ];

            if ('https:' === document.location.protocol) {
              for (var i = 0; i < endpoints.length; i++) {
                endpoints[i] = endpoints[i].replace('http', 'https');
              }
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
  return new MapBoxLayer(config);
};
