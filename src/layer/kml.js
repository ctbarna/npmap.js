/* global L */

'use strict';

var reqwest = require('reqwest'),
  togeojson = require('togeojson'),
  util = require('../util/util');

var KmlLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  initialize: function(options) {
    var me = this;

    L.Util.setOptions(this, this._toLeaflet(options));

    if (typeof options.data === 'string') {
      me._create(options, options.data);
      return this;
    } else {
      var url = options.url;

      util.strict(url, 'string');
      util.loadFile(url, 'xml', function(response) {
        if (response) {
          me._create(options, response);
        } else {
          // TODO: Display load error.
        }
      });
    }
  },
  _create: function(options, data) {
    L.GeoJSON.prototype.initialize.call(this, togeojson.kml(new DOMParser().parseFromString(data, 'text/xml')), options);
    this.fire('ready');
    return this;
  }
});

module.exports = function(options) {
  options = options || {};

  if (options.cluster) {
    return L.npmap.layer._cluster(options);
  } else {
    return new KmlLayer(options);
  }
};
