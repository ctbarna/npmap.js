/* global L */

'use strict';

var util = require('../util/util');

var FullscreenControl = L.Class.extend({
  _onKeyUp: function(e) {
    if (!e) {
      e = window.event;
    }

    if (this._isFullscreen === true && e.keyCode === 27) {
      this.fullscreen();
    }
  },
  fullscreen: function() {
    if (this._isFullscreen) {
      this._container.style.position = 'relative';
      L.DomEvent.removeListener(document, 'keyup', this._onKeyUp);
      this._isFullscreen = false;
      this._map.fire('exitfullscreen');
    } else {
      this._container.style.position = 'fixed';
      L.DomEvent.addListener(document, 'keyup', this._onKeyUp, this);
      this._isFullscreen = true;
      this._map.fire('enterfullscreen');
    }

    this._map.invalidateSize();
  },
  initialize: function(options) {
    var button = document.createElement('button'),
        toolbar = util.getChildElementsByClassName(options.map.getContainer().parentNode.parentNode, 'npmap-toolbar')[0];

    button.className = 'npmap-toolbar-button last-child pull-right';
    // TODO: Also add ARIA attributes.
    button.innerHTML = '<span class="ico-fullscreen"></span>';
    button.title = 'Toggle Fullscreen';
    toolbar.style.display = 'block';
    toolbar.appendChild(button);
    this._container = toolbar.parentNode.parentNode;
    this._isFullscreen = false;
    this._map = options.map;

    L.DomEvent.addListener(button, 'click', this.fullscreen, this);
    util.getChildElementsByClassName(this._container.parentNode, 'npmap-map-wrapper')[0].style.top = '26px';

    return this;
  }
});

L.Map.mergeOptions({
  fullscreenControl: false
});
L.Map.addInitHook(function() {
  if (this.options.fullscreenControl) {
    this.fullscreenControl = L.npmap.control.fullscreen({
      map: this
    });
  }
});

module.exports = function(options) {
  return new FullscreenControl(options);
};