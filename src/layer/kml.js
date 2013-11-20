/* global L */

'use strict';

var
  //reqwest = require('reqwest'),
  togeojson = require('togeojson'),
  util = require('../util/util');

var KmlLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  _stringToDoc: function(str) {
    return new DOMParser().parseFromString(str, 'text/xml');
  },
  initialize: function(config) {
    var me = this;

    config = this._toLeaflet(config);

    // TODO: Test this.
    if (typeof config.data === 'string') {
      L.GeoJSON.prototype.initialize.call(this, togeojson.kml(me._stringToDoc(config.data)), config);
      this._addAttribution();
      return this;
    } else {
      util.strict(config.url, 'string');

      /*
      reqwest({
        success: function(response) {
          console.log(response);
        },
        type: 'xml',
        url: config.url
      });
      */

      var request = new XMLHttpRequest();

      request.onload = function() {
        L.GeoJSON.prototype.initialize.call(me, togeojson.kml(me._stringToDoc(this.responseText)), config);
        me._addAttribution();
        return me;
      };
      request.open('get', config.url, true);
      request.send();
    }
  }
});

module.exports = function(config) {
  return new KmlLayer(config);
};
