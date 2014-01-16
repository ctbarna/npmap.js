/* globals L */

var util = require('../../util/util');

var ArcGisServerDynamicLayer = L.Class.extend({
  includes: [
    require('../../mixin/esri')
  ],
  options: {
    opacity: 1,
    position: 'front'
  },
  _defaultLayerParams: {
    bboxSR: 3857,
    f: 'image',
    format: 'png24',
    imageSR: 3857,
    layers: '',
    transparent: true
  },
  initialize: function(options) {
    util.strict(options.url, 'string');
    this.serviceUrl = this.util.cleanUrl(options.url);
    this._layerParams = L.Util.extend({}, this._defaultLayerParams);

    for (var opt in options) {
      if (options.hasOwnProperty(opt) && this._defaultLayerParams.hasOwnProperty(opt)) {
        this._layerParams[opt] = options[opt];
      }
    }

    this._parseLayers();
    this._parseLayerDefs();
    L.Util.setOptions(this, options);

    if (!this._layerParams.transparent) {
      this.options.opacity = 1;
    }

    if (options.clickable === false) {
      this._hasInteractivity = false;
    }

    this._getMetadata();
  },
  addTo: function(map) {
    map.addLayer(this);
    return this;
  },
  onAdd: function(map) {
    this._map = map;
    this._moveHandler = this.util.debounce(this._update, 150, this);
    map.on('moveend', this._moveHandler, this);

    if (map.options.crs && map.options.crs.code) {
      var sr = map.options.crs.code.split(':')[1];
      this._layerParams.bboxSR = sr;
      this._layerParams.imageSR = sr;
    }

    this._update();
  },
  onRemove: function(map) {
    if (this._currentImage) {
      this._map.removeLayer(this._currentImage);
    }

    map.off('moveend', this._moveHandler, this);
  },
  _getImageUrl: function () {
    var map = this._map,
      bounds = map.getBounds(),
      crs = map.options.crs,
      layerParams = this._layerParams,
      size = map.getSize(),
      ne = crs.project(bounds._northEast),
      options = this.options,
      sw = crs.project(bounds._southWest);

    layerParams.bbox = [sw.x, sw.y, ne.x, ne.y].join(',');
    layerParams.size = size.x + ',' + size.y;

    if (typeof options.edit === 'object' || options.edit === true) {
      layerParams.nocache = new Date().getTime();
    }

    if (options.token) {
      layerParams.token = options.token;
    }

    return this.serviceUrl + 'export' + L.Util.getParamString(layerParams);
  },
  _parseLayerDefs: function () {
    var defs = [],
      layerDefs = this._layerParams.layerDefs;

    if (typeof layerDefs === 'undefined') {
      return;
    }

    if (L.Util.isArray(layerDefs)) {
      var len = layerDefs.length;

      for (var i = 0; i < len; i++) {
        if (layerDefs[i]) {
          defs.push(i + ':' + layerDefs[i]);
        }
      }
    } else if (typeof layerDefs === 'object') {
      for (var layer in layerDefs) {
        if (layerDefs.hasOwnProperty(layer)){
          defs.push(layer + ':' + layerDefs[layer]);
        }
      }
    } else {
      delete this._layerParams.layerDefs;
      return;
    }

    this._layerParams.layerDefs = defs.join(';');
  },
  _parseLayers: function () {
    if (typeof this._layerParams.layers === 'undefined') {
      delete this._layerParams.layerOption;
      return;
    }

    var action = this._layerParams.layerOption || null,
      layers = this._layerParams.layers || null,
      verb = 'show',
      verbs = ['show', 'hide', 'include', 'exclude'];

    delete this._layerParams.layerOption;

    if (!action) {
      if (layers instanceof Array) {
        this._layerParams.layers = verb + ':' + layers.join(',');
      } else if (typeof layers === 'string') {
        var match = layers.match(':');

        if (match) {
          layers = layers.split(match[0]);
          if (Number(layers[1].split(',')[0])) {
            if (verbs.indexOf(layers[0]) !== -1) {
              verb = layers[0];
            }

            layers = layers[1];
          }
        }

        this._layerParams.layers = verb + ':' + layers;
      }
    } else {
      if (verbs.indexOf(action) !== -1) {
        verb = action;
      }

      this._layerParams.layers = verb + ':' + layers;
    }
  },
  _update: function() {
    var bounds, image;

    if (this._animatingZoom) {
      return;
    }

    if (this._map._panTransition && this._map._panTransition._inProgress) {
      return;
    }

    var zoom = this._map.getZoom();

    if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
      return;
    }

    bounds = this._map.getBounds();
    bounds._southWest.wrap();
    bounds._northEast.wrap();
    image = new L.ImageOverlay(this._getImageUrl(), bounds, {
      opacity: 0
    }).addTo(this._map);
    image.on('load', function(e){
      var newImage = e.target;
      var oldImage = this._currentImage;

      if (newImage._bounds.equals(bounds)) {
        this._currentImage = newImage;

        if (this.options.position === 'front') {
          this._currentImage.bringToFront();
        } else {
          this._currentImage.bringToBack();
        }

        this._currentImage.setOpacity(this.options.opacity);

        if (oldImage) {
          this._map.removeLayer(oldImage);
        }
      } else {
        this._map.removeLayer(newImage);
      }
    }, this);
    /*
    this.fire('loading', {
      bounds: bounds
    });
    */
  },
  bringToBack: function(){
    this.options.position = 'back';
    this._currentImage.bringToBack();
    return this;
  },
  bringToFront: function(){
    this.options.position = 'front';
    this._currentImage.bringToFront();
    return this;
  },
  setOpacity: function(opacity){
    this.options.opacity = opacity;
    this._currentImage.setOpacity(opacity);
  }
});

module.exports = function(options) {
  return new ArcGisServerDynamicLayer(options);
};
