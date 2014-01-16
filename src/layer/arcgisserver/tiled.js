/* global L */

'use strict';

var util = require('../../util/util');

var ArcGisServerTiledLayer = L.TileLayer.extend({
  includes: [
    require('../../mixin/esri')
  ],
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  initialize: function(options) {
    L.Util.setOptions(this, options);
    util.strict(options.url, 'string');
    this.serviceUrl = this.util.cleanUrl(options.url);
    this.tileUrl = this.util.cleanUrl(options.url) + 'tile/{z}/{y}/{x}';

    if (options.clickable === false) {
      this._hasInteractivity = false;
    }

    L.TileLayer.prototype.initialize.call(this, this.tileUrl, options);
  },
});

module.exports = function(options) {
  return new ArcGisServerTiledLayer(options);
};
