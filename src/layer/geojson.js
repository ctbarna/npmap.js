/* global L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

var GeoJsonLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(config) {
    config = this._toLeaflet(config);

    if (typeof config.data === 'object') {
      this._create(config, config.data);
    } else {
      var me = this,
        url = config.url;

      util.strict(url, 'string');

      if (util.isLocalUrl(url)) {
        reqwest({
          error: function() {
            console.log('There was an error loading the GeoJSON.');
          },
          success: function(response) {
            me._create(config, response);
          },
          type: 'json',
          url: url
        });
      } else {
        reqwest({
          error: function() {
            console.log('There was an error loading the GeoJSON.');
          },
          success: function(response) {
            me._create(config, response);
          },
          type: 'jsonp',
          url: 'http://npmap-json2jsonp.herokuapp.com/?callback=?&url=' + url
        });
      }
    }
  },
  _create: function(config, data) {
    L.GeoJSON.prototype.initialize.call(this, data, config);
    this._addAttribution();
    return this;
  }
});

module.exports = function(config) {
  return new GeoJsonLayer(config);
};
