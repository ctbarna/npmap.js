/* global L */

'use strict';

var BingLayer = L.TileLayer.extend({
  options: {
    attribution: 'Bing',
    culture: 'en-US',
    layer: 'aerial',
    subdomains: [0, 1, 2, 3]
  },
  initialize: function(options) {
    L.Util.setOptions(this, options);

    this._key = 'Ag4-2f0g7bcmcVgKeNYvH_byJpiPQSx4F9l0aQaz9pDYMORbeBFZ0N3C3A5LSf65';
    this._url = null;
    this.meta = {};
    this.loadMetadata();
  },
  onRemove: function(map) {
    for (var i = 0; i < this._providers.length; i++) {
      var p = this._providers[i];

      if (p.active && this._map.attributionControl) {
        this._map.attributionControl.removeAttribution(p.attrib);
        p.active = false;
      }
    }

    L.TileLayer.prototype.onRemove.apply(this, [map]);
  },
  _update: function() {
    if (this._url == null || !this._map) {
      return;
    }

    this._updateAttribution();
    L.TileLayer.prototype._update.apply(this, []);
  },
  _updateAttribution: function() {
    var bounds = this._map.getBounds(),
      zoom = this._map.getZoom();

    for (var i = 0; i < this._providers.length; i++) {
      var p = this._providers[i];

      if ((zoom <= p.zoomMax && zoom >= p.zoomMin) && bounds.intersects(p.bounds)) {
        if (!p.active && this._map.attributionControl) {
          this._map.attributionControl.addAttribution(p.attrib);
        }

        p.active = true;
      } else {
        if (p.active && this._map.attributionControl) {
          this._map.attributionControl.removeAttribution(p.attrib);
        }

        p.active = false;
      }
    }
  },
  getTileUrl: function(p) {
    var subdomains = this.options.subdomains,
      s = this.options.subdomains[Math.abs((p.x + p.y) % subdomains.length)],
      z = this._getZoomForUrl();

    return this._url.replace('{subdomain}', s)
      .replace('{quadkey}', this.tile2quad(p.x, p.y, z))
      .replace('http:', document.location.protocol)
      .replace('{culture}', this.options.culture);
  },
  initMetadata: function() {
    var r = this.meta.resourceSets[0].resources[0];

    this.options.subdomains = r.imageUrlSubdomains;
    this._url = r.imageUrl;
    this._providers = [];

    if (r.imageryProviders) {
      for (var i = 0; i < r.imageryProviders.length; i++) {
        var p = r.imageryProviders[i];

        for (var j = 0; j < p.coverageAreas.length; j++) {
          var c = p.coverageAreas[j],
            coverage = {zoomMin: c.zoomMin, zoomMax: c.zoomMax, active: false},
            bounds = new L.LatLngBounds(
              new L.LatLng(c.bbox[0]+0.01, c.bbox[1]+0.01),
              new L.LatLng(c.bbox[2]-0.01, c.bbox[3]-0.01)
            );

          coverage.bounds = bounds;
          coverage.attrib = p.attribution;
          this._providers.push(coverage);
        }
      }
    }

    this._update();
  },
  loadMetadata: function() {
    var cbid = '_bing_metadata_' + L.Util.stamp(this),
      me = this,
      script = document.createElement('script');

    window[cbid] = function(meta) {
      var e = document.getElementById(cbid);

      me.meta = meta;
      window[cbid] = undefined;
      e.parentNode.removeChild(e);

      if (meta.errorDetails) {
        if (window.console) {
          console.error('Error: ' + meta.errorDetails);
        }

        return;
      }

      me.initMetadata();
    };

    script.src = document.location.protocol + '//dev.virtualearth.net/REST/v1/Imagery/Metadata/' + this.options.layer + '?include=ImageryProviders&jsonp=' + cbid + '&key=' + this._key;
    script.id = cbid;
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  tile2quad: function(x, y, z) {
    var quad = '';

    for (var i = z; i > 0; i--) {
      var digit = 0,
        mask = 1 << (i - 1);

      if ((x & mask) !== 0) {
        digit += 1;
      }

      if ((y & mask) !== 0) {
        digit += 2;
      }

      quad = quad + digit;
    }

    return quad;
  }
});

module.exports = function(options) {
  return new BingLayer(options);
};
