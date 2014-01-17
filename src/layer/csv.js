/* global L */

'use strict';

var reqwest = require('reqwest'),
  csv2geojson = require('csv2geojson'),
  util = require('../util/util');

var CsvLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(config) {
    var me = this;

    config = this._toLeaflet(config);

    if (typeof config.data === 'string') {
      me._create(config, config.data);
      return this;
    } else {
      var url = config.url;

      util.strict(url, 'string');
      util.loadFile(url, 'text', function(response) {
        if (response) {
          me._create(config, response);
        } else {
          // TODO: Display load error.
        }
      });
    }
  },
  _create: function(config, csv) {
    var me = this;

    csv2geojson.csv2geojson(csv, {}, function(error, data) {
      L.GeoJSON.prototype.initialize.call(me, data, config);
      me._complete();
      return me;
    });
  }
});

module.exports = function(config) {
  config = config || {};

  if (config.cluster) {
    return L.npmap.layer._cluster(config);
  } else {
    return new CsvLayer(config);
  }
};
