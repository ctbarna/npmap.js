/* global L */

'use strict';

var util = require('../util/util');
require('../cluster/leaflet.markercluster-src');

var ClusterLayer = L.MarkerClusterGroup.extend({
  initialize: function(config) {
    // More information on the options here: https://github.com/Leaflet/Leaflet.markercluster/blob/master/README.md#all-options
    L.Util.setOptions(this, config.cluster);
    delete config.cluster;
    this.L = L.npmap.layer[config.type](config);

    // Defaults
    //
    if (!this.options.iconCreateFunction) {
      this.options.iconCreateFunction = this._defaultIconCreateFunction;
    }
    this._featureGroup = L.featureGroup();
    this._featureGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

    this._nonPointGroup = L.featureGroup();
    this._nonPointGroup.on(L.FeatureGroup.EVENTS, this._propagateEvent, this);

    this._inZoomAnimation = 0;
    this._needsClustering = [];
    this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of
    //The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
    this._currentShownBounds = null;
    //
    // Assign options
    console.log('options', this);
    this.showCoveageOnHover = false;

    var that = this;
    this.L.on('ready', function(me) {
      console.log('ready');
      that.addLayer(me.target);
    }, this);

    return this;
  }
});

module.exports = function(config) {
  return new ClusterLayer(config);
};
