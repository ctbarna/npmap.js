/* globals L */

'use strict';

/**
 * Forked from https://github.com/aratcliffe/Leaflet.tooltip.
 */
var Tooltip = L.Class.extend({
  options: {
    fadeAnimation: false,
    hideDelay: 0,
    maxWidth: '',
    minWidth: '',
    mouseOffset: L.point(15, 0),
    padding: '2px 4px',
    showDelay: 0,
    trackMouse: true,
    width: 'auto'
  },
  _bindTarget: function(target) {
    L.DomEvent
      .on(target, 'mouseover', this._onTargetMouseover, this)
      .on(target, 'mouseout', this._onTargetMouseout, this)
      .on(target, 'mousemove', this._onTargetMousemove, this);
  },
  _createTip: function() {
    this._map = this.options.map;

    if (!this._map) {
      throw new Error('No map configured for tooltip');
    }

    this._container = L.DomUtil.create('div', 'leaflet-tooltip');
    this._container.style.maxWidth = this._isNumeric(this.options.maxWidth) ? this.options.maxWidth + 'px' : this.options.maxWidth;
    this._container.style.minWidth = this._isNumeric(this.options.minWidth) ? this.options.minWidth + 'px' : this.options.minWidth;
    this._container.style.padding = this._isNumeric(this.options.padding) ? this.options.padding + 'px' : this.options.padding;
    this._container.style.position = 'absolute';
    this._container.style.width = this._isNumeric(this.options.width) ? this.options.width + 'px' : this.options.width;

    if (this.options.html) {
      this.setHtml(this.options.html);
    }

    if (this.options.target) {
      this.setTarget(this.options.target);
    }

    this._map._tooltipContainer.appendChild(this._container);
  },
  _delay: function(func, scope, delay) {
    var me = this;

    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    this._timeout = setTimeout(function() {
      func.call(scope);
      delete me._timeout;
    }, delay);
  },
  _getElementSize: function(el) {
    var size = this._size;

    if (!size || this._sizeChanged) {
      size = {};
      el.style.left = '-999999px';
      el.style.right = 'auto';
      el.style.display = 'inline-block';
      size.x = el.offsetWidth;
      size.y = el.offsetHeight;
      el.style.left = 'auto';
      el.style.display = 'none';
      this._sizeChanged = false;
    }
    return size;
  },
  _hide: function() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    L.DomUtil.removeClass(this._container, 'leaflet-tooltip-fade');
    this._container.style.display = 'none';
    this.showing = false;

    if (this._map.activeTip === this) {
      delete this._map.activeTip;
    }
  },
  _isNumeric: function(val) {
    return !isNaN(parseFloat(val)) && isFinite(val);
  },
  _onTargetMousemove: function(e) {
    L.DomEvent.stopPropagation(e);

    if (this.options.trackMouse) {
      this.setPosition(this._map.mouseEventToContainerPoint(e));
    }
  },
  _onTargetMouseout: function() {
    this.hide();
  },
  _onTargetMouseover: function(e) {
    this.show(this._map.mouseEventToContainerPoint(e));
  },
  _show: function() {
    this._container.style.display = 'inline-block';
    L.DomUtil.addClass(this._container, 'leaflet-tooltip-fade');
    this._showing = true;
  },
  _unbindTarget: function(target) {
    L.DomEvent
      .off(target, 'mouseover', this._onTargetMouseover, this)
      .off(target, 'mouseout', this._onTargetMouseout, this)
      .off(target, 'mousemove', this._onTargetMousemove, this);
  },
  hide: function() {
    if (this.options.hideDelay) {
      this._delay(this._hide, this, this.options.hideDelay);
    } else {
      this._hide();
    }
  },
  initialize: function(options) {
    L.setOptions(this, options);
    this._createTip();
  },
  isVisible: function() {
    return this._showing;
  },
  remove: function() {
    this._container.parentNode.removeChild(this._container);
    delete this._container;

    if (this._target) {
      this._unbindTarget(this._target);
    }
  },
  setHtml: function(html) {
    if (typeof html === 'string') {
      this._container.innerHTML = html;
    } else {
      while (this._container.hasChildNodes()) {
        this._container.removeChild(this._container.firstChild);
      }

      this._container.appendChild(this._content);
    }
    
    this._sizeChanged = true;
  },
  setPosition: function(point) {
    var container = this._container,
      containerSize = this._getElementSize(this._container),
      mapSize = this._map.getSize(),
      offset = this.options.mouseOffset || {x: 0, y: 0};

    if (point.x + containerSize.x > mapSize.x - offset.x - 5) {
      container.style.left = 'auto';
      container.style.right = (mapSize.x - point.x + (offset.x - 5)) + 'px';
    } else {
      container.style.left = point.x + offset.x + 'px';
      container.style.right = 'auto';
    }
    
    if (point.y + containerSize.y > mapSize.y) {
      container.style.top = 'auto';
      container.style.bottom = (mapSize.y - point.y) + 'px';
    } else {
      container.style.top = point.y + 'px';
      container.style.bottom = 'auto';
    }
  },
  setTarget: function(target) {
    if (target._icon) {
      target = target._icon;
    }

    if (target === this._target) {
      return;
    }

    if (this._target) {
      this._unbindTarget(this._target);
    }

    this._bindTarget(target);
    this._target = target;
  },
  show: function(point, html) {
    if (this._map.activeTip && (this._map.activeTip !== this)) {
      this._map.activeTip._hide();
    }

    this._map.activeTip = this;
    
    if (html) {
      this.setHtml(html);
    }

    this.setPosition(point);

    if (this.options.showDelay) {
      this._delay(this._show, this, this.options.hideDelay);
    } else {
      this._show();
    }
  }
});

L.Map.addInitHook(function() {
  this._tooltipContainer = L.DomUtil.create('div', 'leaflet-tooltip-container', this._container);
});

module.exports = function(options) {
  return new Tooltip(options);
};
