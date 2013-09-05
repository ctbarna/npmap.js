/* global L */

'use strict';

var OverviewControl = L.Control.extend({
  hideText: 'Hide MiniMap',
  options: {
    autoToggleDisplay: false,
    height: 150,
    position: 'bottomright',
    toggleDisplay: true,
    width: 150,
    zoomAnimation: false,
    zoomLevelFixed: false,
    zoomLevelOffset: -5
  },
  showText: 'Show MiniMap',
  addTo: function(map) {
    L.Control.prototype.addTo.call(this, map);
    this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
    this._setDisplay(this._decideMinimized());

    return this;
  },
  initialize: function (options) {
    if (options) {
      L.Util.setOptions(this, options);

      if (typeof options.layer === 'object') {
        this._layer = options.layer;
      }
    }
  },
  onAdd: function(map) {
    // TODO: Grab the baseLayer from the map object, clone the object, delete baseLayer.L, and pass into map constructor below.

    if (!this._layer) {
      // Do something here.
    }

    this._mainMap = map;
    this._container = L.DomUtil.create('div', 'leaflet-control-minimap');
    this._container.style.height = this.options.height + 'px';
    this._container.style.width = this.options.width + 'px';

    L.DomEvent.disableClickPropagation(this._container);
    L.DomEvent.on(this._container, 'mousewheel', L.DomEvent.stopPropagation);

    this._miniMap = new L.npmap.map({
      attributionControl: false,
      autoToggleDisplay: this.options.autoToggleDisplay,
      baseLayers: [
        this._layer
      ],
      boxZoom: !this.options.zoomLevelFixed,
      crs: map.options.crs,
      div: this._container,
      doubleClickZoom: !this.options.zoomLevelFixed,
      smallzoomControl: false,
      scrollWheelZoom: !this.options.zoomLevelFixed,
      touchZoom: !this.options.zoomLevelFixed,
      zoomAnimation: this.options.zoomAnimation
    });

    this._mainMapMoving = false;
    this._miniMapMoving = false;
    this._minimized = false;
    this._userToggledDisplay = false;

    if (this.options.toggleDisplay) {
      this._addToggleButton();
    }

    this._miniMap.whenReady(L.Util.bind(function () {
      this._aimingRect = L.rectangle(this._mainMap.getBounds(), {
        clickable: false,
        color: '#ff7800',
        weight: 1
      }).addTo(this._miniMap);
      this._shadowRect = L.rectangle(this._mainMap.getBounds(), {
        clickable: false,
        color: '#000',
        fillOpacity: 0,
        opacity: 0,
        weight: 1
      }).addTo(this._miniMap);
      this._mainMap.on('moveend', this._onMainMapMoved, this);
      this._mainMap.on('move', this._onMainMapMoving, this);
      this._miniMap.on('movestart', this._onMiniMapMoveStarted, this);
      this._miniMap.on('move', this._onMiniMapMoving, this);
      this._miniMap.on('moveend', this._onMiniMapMoved, this);
    }, this));

    return this._container;
  },
  onRemove: function () {
    this._mainMap.off('moveend', this._onMainMapMoved, this);
    this._mainMap.off('move', this._onMainMapMoving, this);
    this._miniMap.off('moveend', this._onMiniMapMoved, this);
    this._miniMap.removeLayer(this._layer);
  },
  _addToggleButton: function () {
    this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton('', this.hideText, 'leaflet-control-minimap-toggle-display', this._container, this._toggleDisplayButtonClicked, this) : undefined;
  },
  _createButton: function(html, title, className, container, fn, context) {
    var link = L.DomUtil.create('a', className, container),
        stop = L.DomEvent.stopPropagation;

    link.innerHTML = html;
    link.href = '#';
    link.title = title;

    L.DomEvent
      .on(link, 'click', stop)
      .on(link, 'mousedown', stop)
      .on(link, 'dblclick', stop)
      .on(link, 'click', L.DomEvent.preventDefault)
      .on(link, 'click', fn, context);

    return link;
  },
  _decideMinimized: function () {
    if (this._userToggledDisplay) {
      return this._minimized;
    }

    if (this.options.autoToggleDisplay) {
      if (this._mainMap.getBounds().contains(this._miniMap.getBounds())) {
        return true;
      }

      return false;
    }

    return this._minimized;
  },
  _decideZoom: function(fromMaintoMini) {
    if (!this.options.zoomLevelFixed) {
      if (fromMaintoMini) {
        return this._mainMap.getZoom() + this.options.zoomLevelOffset;
      } else {
        var currentDiff = this._miniMap.getZoom() - this._mainMap.getZoom(),
            proposedZoom = this._miniMap.getZoom() - this.options.zoomLevelOffset,
            toRet;

        if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._miniMap.getMinZoom() - this.options.zoomLevelOffset) {
          if (this._miniMap.getZoom() > this._lastMiniMapZoom) {
            toRet = this._mainMap.getZoom() + 1;
            this._miniMap.setZoom(this._miniMap.getZoom() - 1);
          } else {
            toRet = this._mainMap.getZoom();
          }
        } else {
          toRet = proposedZoom;
        }

        this._lastMiniMapZoom = this._miniMap.getZoom();

        return toRet;
      }
    } else {
      if (fromMaintoMini) {
        return this.options.zoomLevelFixed;
      } else {
        return this._mainMap.getZoom();
      }
    }
  },
  _minimize: function () {
    if (this.options.toggleDisplay) {
      this._container.style.height = '19px';
      this._container.style.width = '19px';
      this._toggleDisplayButton.className += ' minimized';
    } else {
      this._container.style.display = 'none';
    }

    this._minimized = true;
  },
  _onMainMapMoved: function () {
    if (!this._miniMapMoving) {
      this._mainMapMoving = true;
      this._miniMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
      this._setDisplay(this._decideMinimized());
    } else {
      this._miniMapMoving = false;
    }

    this._aimingRect.setBounds(this._mainMap.getBounds());
  },
  _onMainMapMoving: function () {
    this._aimingRect.setBounds(this._mainMap.getBounds());
  },
  _onMiniMapMoved: function () {
    if (!this._mainMapMoving) {
      this._miniMapMoving = true;
      this._mainMap.setView(this._miniMap.getCenter(), this._decideZoom(false));
      this._shadowRect.setStyle({
        fillOpacity:0,
        opacity:0
      });
    } else {
      this._mainMapMoving = false;
    }
  },
  _onMiniMapMoveStarted:function () {
    var lastAimingRect = this._aimingRect.getBounds();

    this._lastAimingRectPosition = {
      sw: this._miniMap.latLngToContainerPoint(lastAimingRect.getSouthWest()),
      ne: this._miniMap.latLngToContainerPoint(lastAimingRect.getNorthEast())
    };
  },
  _onMiniMapMoving: function () {
    if (!this._mainMapMoving && this._lastAimingRectPosition) {
      this._shadowRect.setBounds(new L.LatLngBounds(this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.sw),this._miniMap.containerPointToLatLng(this._lastAimingRectPosition.ne)));
      this._shadowRect.setStyle({opacity:1,fillOpacity:0.3});
    }
  },
  _restore: function () {
    if (this.options.toggleDisplay) {
      this._container.style.height = this.options.height + 'px';
      this._container.style.width = this.options.width + 'px';
      this._toggleDisplayButton.className = this._toggleDisplayButton.className.replace(/(?:^|\s)minimized(?!\S)/g, '');
    } else {
      this._container.style.display = 'block';
    }

    this._minimized = false;
  },
  _setDisplay: function(minimize) {
    if (minimize !== this._minimized) {
      if (!this._minimized) {
        this._minimize();
      } else {
        this._restore();
      }
    }
  },
  _toggleDisplayButtonClicked: function () {
    this._userToggledDisplay = true;

    if (!this._minimized) {
      this._minimize();
      this._toggleDisplayButton.title = this.showText;
    } else {
      this._restore();
      this._toggleDisplayButton.title = this.hideText;
    }
  }
});

L.Map.mergeOptions({
  overviewControl: false
});
L.Map.addInitHook(function() {
  if (this.options.overviewControl) {
    var options = {};

    if (typeof this.options.overviewControl === 'object') {
      options = this.options.overviewControl;
    }

    this.overviewControl = new L.npmap.control.overview(options).addTo(this);
  }
});

module.exports = function(options) {
  return new OverviewControl(options);
};