/* global L */

'use strict';

var util = require('../util');

var ArcGisServerLayer = L.TileLayer.extend({
  // The default options to initialize the layer with.
  options: {
    errorTileUrl: null
  },
  _removeAttribution: function() {
    if (this.options.attribution) {
      this._map.attributionControl.removeAttribution(this.options.attribution);
      this.options.attribution = null;
    }
  },
  _updateAttribution: function() {
    var map = this._map,
        bounds = map.getBounds(),
        include = [],
        zoom = map.getZoom();

    this._removeAttribution();

    for (var i = 0; i < this._dynamicAttributionData.length; i++) {
      var contributor = this._dynamicAttributionData[i];

      for (var j = 0; j < contributor.coverageAreas.length; j++) {
        var coverageArea = contributor.coverageAreas[j],
            coverageBounds = coverageArea.bbox;

        if (zoom >= coverageArea.zoomMin && zoom <= coverageArea.zoomMax) {
          if (bounds.intersects(L.latLngBounds(L.latLng(coverageBounds[0], coverageBounds[3]), L.latLng(coverageBounds[2], coverageBounds[1])))) {
            include.push(contributor.attribution);
            break;
          }
        }
      }
    }

    if (include.length) {
      this.options.attribution = include.join(' | ');
      map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  initialize: function(config) {
    util.strict(config.url, 'string');
    L.TileLayer.prototype.initialize.call(this, config.url, config);

    if (this.options.dynamicAttribution && this.options.dynamicAttribution.indexOf('http') === 0) {
      var me = this;

      util.request(me.options.dynamicAttribution, function(error, response) {
        me._dynamicAttributionData = response.contributors;
        me._map.on('viewreset zoomend dragend', me._updateAttribution, me);
        me.on('load', me._updateAttribution, me);
      });
    }

    return this;
  },
  onRemove: function(map) {
    if (this._dynamicAttributionData) {
      this._removeAttribution();
      this.off('load', this._updateAttribution, this);
      this._map.off('viewreset zoomend dragend', this._updateAttribution, this);
    }

    L.TileLayer.prototype.onRemove.call(this, map);
  }
});

module.exports = function(config) {
  return new ArcGisServerLayer(config);
};