/* global L */

'use strict';

var util = require('../util/util');

var SwitcherControl = L.Control.extend({
  options: {
    position: 'topright'
  },
  _addLi: function(baseLayer) {
    var li = L.DomUtil.create('li', (baseLayer.visible ? 'selected' : null));

    li.innerHTML = baseLayer.name;
    li.layerId = L.stamp(baseLayer);

    this._list.appendChild(li);
  },
  _initLayout: function() {
    var active,
      container = this._container = L.DomUtil.create('div', 'npmap-control-switcher');

    container.setAttribute('aria-haspopup', true);

    if (!L.Browser.touch) {
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(container, 'mousewheel', L.DomEvent.stopPropagation);
    } else {
      L.DomEvent.on(container, 'click', L.DomEvent.stopPropagation);
    }

    active = L.DomUtil.create('div', null, container);
    this._list = L.DomUtil.create('ul', null, container);
    this._list.style.display = 'none';
    this._activeIcon = L.DomUtil.create('span', null, active);
    L.DomUtil.create('ico', null, this._activeIcon);
    this._activeText = L.DomUtil.create('div', null, active);
    this._activeDropdown = L.DomUtil.create('span', null, active);
    L.DomEvent.addListener(active, 'click', this._toggleList, this);
  },
  _onLayerChange: function(e) {
    var obj = this._baseLayers[L.stamp(e.layer)],
      type;

    if (!obj) {
      return;
    }

    if (!obj.overlay) {
      type = (e.type === 'layeradd' ? 'baselayerchange' : null);
    }

    if (type) {
      this._map.fire(type, obj);
    }
  },
  _onClick: function(e) {
    var target = util.getEventObjectTarget(e);

    if (!L.DomUtil.hasClass(target, 'selected')) {
      var added = false,
        children = util.getChildElementsByNodeName(this._list, 'li'),
        removed = false,
        i;

      for (i = 0; i < children.length; i++) {
        var li = children[i];

        if (L.DomUtil.hasClass(li, 'selected')) {
          L.DomUtil.removeClass(li, 'selected');
          break;
        }
      }

      for (i = 0; i < this._baseLayers.length; i++) {
        var baseLayer = this._baseLayers[i];

        if (baseLayer.L) {
          this._map.removeLayer(baseLayer.L);
          baseLayer.visible = false;
          removed = true;
          delete baseLayer.L;
        } else if (target.layerId === baseLayer._leaflet_id) {
          baseLayer.visible = true;
          baseLayer.L = L.npmap.layer[baseLayer.type](baseLayer);
          this._map.addLayer(baseLayer.L, true);
          L.DomUtil.addClass(target, 'selected');
          this._setActive(baseLayer);
          added = true;
        }

        if (added && removed) {
          break;
        }
      }
    }

    this._toggleList();
  },
  _setActive: function(baseLayer) {
    var icon = baseLayer.icon;

    if (!icon) {
      icon = 'generic';
    }

    // TODO: Fix up.
    icon = 'nps';
    L.DomUtil.addClass(this._activeIcon.childNodes[0], 'ico-' + icon + '-small');
    this._activeText.innerHTML = baseLayer.name;
  },
  _toggleList: function() {
    if (this._list.style.display && this._list.style.display === 'none') {
      this._list.style.display = 'block';
      L.DomUtil.addClass(this._activeDropdown, 'open');
    } else {
      this._list.style.display = 'none';
      L.DomUtil.removeClass(this._activeDropdown, 'open');
    }
  },
  _update: function() {
    var children, i;

    this._activeIcon.childNodes[0].innerHTML = '';
    this._activeText.innerHTML = '';
    this._list.innerHTML = '';

    for (i = 0; i < this._baseLayers.length; i++) {
      var baseLayer = this._baseLayers[i];

      this._addLi(baseLayer);

      if (baseLayer.L) {
        this._setActive(baseLayer);
      }
    }

    children = util.getChildElementsByNodeName(this._list, 'li');

    for (i = 0; i < children.length; i++) {
      L.DomEvent.addListener(children[i], 'click', this._onClick, this);
    }
  },
  initialize: function(baseLayers) {
    this._baseLayers = baseLayers;
  },
  onAdd: function(map) {
    this._initLayout();
    this._update();
    map
      .on('layeradd', this._onLayerChange, this)
      .on('layerremove', this._onLayerChange, this);

    return this._container;
  },
  onRemove: function(map) {
    map
      .off('layeradd', this._onLayerChange, this)
      .off('layerremove', this._onLayerChange, this);
  }
});

L.Map.addInitHook(function() {
  if (this.options.baseLayers && this.options.baseLayers.length > 1) {
    this.switcherControl = L.npmap.control.switcher(this.options.baseLayers).addTo(this);
  }
});

module.exports = function(baseLayers) {
  return new SwitcherControl(baseLayers);
};
