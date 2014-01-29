/* global L */
/* jshint camelcase: false */

'use strict';

var Maki = require('../icon/maki');

require('leaflet-draw');

var EditControl = L.Control.extend({
  includes: L.Mixin.Events,
  options: {
    circle: {
      metric: false
    },
    marker: {
      icon: new Maki()
    },
    polygon: {
      metric: false
    },
    polyline: {
      metric: false
    },
    position: 'topleft',
    rectangle: {
      metric: false
    }
  },
  initialize: function(options) {
    L.Util.setOptions(this, options);
    this._activeMode = null;
    this._featureGroup = new L.FeatureGroup();
    this._modes = {};
    return this;
  },
  onAdd: function(map) {
    var container = L.DomUtil.create('div', 'leaflet-control-edit leaflet-bar'),
      editId,
      editShape,
      me = this;

    if (this.options.marker) {
      this._initializeMode(container, new L.Draw.Marker(map, this.options.marker), 'Draw a marker');
    }

    if (this.options.polyline) {
      this._initializeMode(container, new L.Draw.Polyline(map, this.options.polyline), 'Draw a line');
    }

    if (this.options.polygon) {
      this._initializeMode(container, new L.Draw.Polygon(map, this.options.polygon), 'Draw a polygon');
    }

    if (this.options.rectangle) {
      this._initializeMode(container, new L.Draw.Rectangle(map, this.options.rectangle), 'Draw a rectangle');
    }

    if (this.options.circle) {
      this._initializeMode(container, new L.Draw.Circle(map, this.options.circle), 'Draw a circle');
    }

    this._featureGroup.on('click', function(e) {
      var editing = e.layer.editing,
        leafletId;

      if (editing) {
        if (editing._poly) {
          leafletId = editing._poly._leaflet_id;
        } else {
          leafletId = editing._shape._leaflet_id;
        }

        if (editId === leafletId) {
          e.layer.editing.disable();
          editId = null;
          editShape = null;
        } else {
          if (editShape) {
            editShape.editing.disable();
          }

          e.layer.editing.enable();
          editId = leafletId;
          editShape = e.layer;
        }
      } else {
        if (editShape) {
          editShape.editing.disable();
          editId = null;
          editShape = null;
        }
      }
    });
    map.addLayer(this._featureGroup);
    map.on('click', function() {
      if (editShape) {
        editShape.editing.disable();
        editId = null;
        editShape = null;
      }
    });
    map.on('draw:created', function(e) {
      me._featureGroup.addLayer(e.layer);

      if (e.layerType === 'marker') {
        e.layer.dragging.enable();
        e.layer.on('dragstart', function() {
          if (editShape) {
            editShape.editing.disable();
            editId = null;
            editShape = null;
          }
        });
      }
    });
    map.on('draw:drawstart', function() {
      if (editShape) {
        editShape.editing.disable();
        editId = null;
        editShape = null;
      }
    });

    return container;
  },
  _handlerActivated: function(e) {
    if (this._activeMode && this._activeMode.handler.enabled()) {
      this._activeMode.handler.disable();
    }

    this._activeMode = this._modes[e.handler];
    
    if (this._activeMode.button) {
      L.DomUtil.addClass(this._activeMode.button, 'pressed');
    }

    this.fire('enable');
  },
  _handlerDeactivated: function() {
    if (this._activeMode.button) {
      L.DomUtil.removeClass(this._activeMode.button, 'pressed');
    }

    this._activeMode = null;
    this.fire('disable');
  },
  _initializeMode: function(container, handler, title) {
    var type = handler.type,
      me = this,
      button = null;

    this._modes[type] = {};
    this._modes[type].handler = handler;

    if (this.options.ui) {
      button = L.DomUtil.create('button', type, container);
      button.title = title;
      L.DomEvent.disableClickPropagation(button);
      L.DomEvent.on(button, 'click', function() {
        if (me._activeMode && me._activeMode.handler.type === type) {
          me._modes[type].handler.disable();
        } else {
          me._modes[type].handler.enable();
        }
      }, this._modes[type].handler);
    }

    this._modes[type].button = button;
    this._modes[type].handler
      .on('disabled', this._handlerDeactivated, this)
      .on('enabled', this._handlerActivated, this);
  },
  activateMode: function(type) {
    this._modes[type].handler.enable();
  },
  clearShapes: function() {
    this._featureGroup.clearLayers();
  },
  deactivateMode: function(type) {
    this._modes[type].handler.disable();
  }
});

L.Map.mergeOptions({
  editControl: false
});
L.Map.addInitHook(function() {
  if (this.options.editControl) {
    var options = {};

    if (typeof this.options.drawControl === 'object') {
      options = this.options.drawControl;
    }

    options.ui = true;
    this.editControl = L.npmap.control.edit(options).addTo(this);
  } else {
    var edit = false;

    for (var i = 0; i < this.options.overlays.length; i++) {
      if (this.options.overlays[i].edit) {
        edit = true;
        break;
      }
    }

    if (edit) {
      this.editControl = L.npmap.control.edit({
        ui: false
      }).addTo(this);
    }
  }
});

module.exports = function(options) {
  return new EditControl(options);
};
