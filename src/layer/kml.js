/* global L */

'use strict';

var reqwest = require('reqwest'),
  togeojson = require('togeojson'),
  util = require('../util/util');

var KmlLayer = L.GeoJSON.extend({
  includes: [
    require('../mixin/geojson')
  ],
  _create: function(config, response) {
    L.GeoJSON.prototype.initialize.call(this, togeojson.kml(new DOMParser().parseFromString(response, 'text/xml')), config);
    this._addAttribution();
    return this;
  },
  initialize: function(config) {
    var me = this;

    config = this._toLeaflet(config);

    if (typeof config.data === 'string') {
      me._create(config, config.data);
      return this;
    } else {
      var url = config.url;

      util.strict(url, 'string');

      if (util.isLocalUrl(url)) {
        var request = new XMLHttpRequest();

        request.onload = function() {
          me._create(config, this.responseText);
        };
        request.open('get', url, true);
        request.send();
      } else {
        reqwest({
          success: function(response) {
            me._create(config, response);
          },
          type: 'jsonp',
          url: 'http://npmap-xml2jsonp.herokuapp.com/?callback=?&url=' + url
        });
      }
    }
  }
});

module.exports = function(config) {
  return new KmlLayer(config);
};
