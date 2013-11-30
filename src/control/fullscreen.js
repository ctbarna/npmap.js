/* global L */

'use strict';

var util = require('../util/util');

var FullscreenControl = L.Control.extend({
  initialize: function(options) {
    // TODO: Also add ARIA attributes.
    this._button = document.createElement('button');
    this._button.className = 'npmap-toolbar-button last-child pull-right';
    this._button.innerHTML = '<span class="ico-fullscreen"></span>';
    this._button.title = 'Toggle fullscreen';
    L.DomEvent.addListener(this._button, 'click', this.fullscreen, this);

    return this;
  },
  _onKeyUp: function(e) {
    if (!e) {
      e = window.event;
    }

    if (this._isFullscreen === true && e.keyCode === 27) {
      this.fullscreen();
    }
  },
  addTo: function(map) {
    var toolbar = util.getChildElementsByClassName(map.getContainer().parentNode.parentNode, 'npmap-toolbar')[0];

    toolbar.appendChild(this._button);
    toolbar.style.display = 'block';
    this._container = toolbar.parentNode.parentNode;
    this._isFullscreen = false;
    this._map = map;
    util.getChildElementsByClassName(this._container.parentNode, 'npmap-map-wrapper')[0].style.top = '26px';
    return this;
  },
  fullscreen: function() {
    var body = document.body;

    if (this._isFullscreen) {
      body.style.margin = this._bodyMargin;
      body.style.overflow = this._bodyOverflow;
      body.style.padding = this._bodyPadding;
      this._container.style.left = 'auto';
      this._container.style.top = 'auto';
      this._container.style.position = 'relative';
      L.DomEvent.removeListener(document, 'keyup', this._onKeyUp);
      this._isFullscreen = false;
      this._map.fire('exitfullscreen');
    } else {
      this._bodyMargin = body.style.margin;
      this._bodyOverflow = body.style.overflow;
      this._bodyPadding = body.style.padding;
      body.style.margin = '0';
      body.style.overflow = 'hidden';
      body.style.padding = '0';
      this._container.style.left = '0';
      this._container.style.top = '0';
      this._container.style.position = 'fixed';
      L.DomEvent.addListener(document, 'keyup', this._onKeyUp, this);
      this._isFullscreen = true;
      this._map.fire('enterfullscreen');
    }

    this._map.invalidateSize();
  }
});

L.Map.mergeOptions({
  fullscreenControl: false
});
L.Map.addInitHook(function() {
  if (this.options.fullscreenControl) {
    var options = {};

    if (typeof this.options.fullscreenControl === 'object') {
      options = this.options.fullscreenControl;
    }

    this.fullscreenControl = L.npmap.control.fullscreen(options).addTo(this);
  }
});

module.exports = function(options) {
  return new FullscreenControl(options);
};
