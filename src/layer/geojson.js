/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GeoJsonLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(config) {
    this._config = this._toLeaflet(config);

    if (typeof config.data === 'object') {
      L.GeoJSON.prototype.initialize.call(this, config.data, config);
      this._addAttribution();
      return this;
    } else {
      var me = this;

      util.strict(config.url, 'string');

      if (config.url.indexOf('http://') === -1 && config.url.indexOf('https://') === -1) {
        reqwest({
          error: function(error) {
            console.log('The GeoJSON layer cannot be loaded. Error: ' + error + '.');
          },
          success: function(response) {
            L.GeoJSON.prototype.initialize.call(me, response, me._config);
            me._addAttribution();
            return me;
          },
          type: 'json',
          url: config.url
        });
      } else {
        reqwest({
          crossOrigin: true,
          error: function() {
            console.log('The GeoJSON layer cannot be loaded via CORS. Will now try JSONP.');

            try {
              reqwest({
                success: function(response) {
                  L.GeoJSON.prototype.initialize.call(me, response, me._config);
                  me._addAttribution();
                  return me;
                },
                type: 'jsonp',
                url: config.url
              });
            } catch (exception) {
              console.log('The GeoJSON layer cannot be loaded via JSONP. Perhaps you need to add a callback parameter to the URL config property?');
            }
          },
          success: function(response) {
            L.GeoJSON.prototype.initialize.call(me, response, me._config);
            me._addAttribution();
            return me;
          },
          type: 'json',
          url: config.url
        });
      }
    }
  }
});

module.exports = function(config) {
  return new GeoJsonLayer(config);
};
