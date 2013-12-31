/* global L */
/* jshint camelcase: false */

'use strict';

var MakiIcon = require('../icon/maki');

require('leaflet-draw');

var EditControl = L.Control.Draw.extend({
  options: {
    draw: {
      circle: {
        metric: false
      },
      marker: {
        icon: new MakiIcon()
      },
      polygon: {
        metric: false
      },
      polyline: {
        metric: false
      },
      rectangle: {
        metric: false
      }
    }
  },
  initialize: function(options) {
    // TODO: Create a toolbar with a dropdown (layer 1, layer 2, create new layer...) and a save button.
    L.Util.setOptions(this, options);

    this._featureGroup = options.edit.featureGroup;
    L.drawLocal.draw.toolbar.buttons.polyline = 'Draw a line';

    /*
    if (typeof options.overlayTools === 'undefined' || options.overlayTools === true) {
      var overlayTools = L.Toolbar.extend({
        initialize: function(options) {

        },
        addToolbar: function(map) {

        },
        removeToolbar: function(map) {

        }
      });
    }
    */

    L.Control.Draw.prototype.initialize.call(this, options);
  },
  addTo: function(map) {
    var editId = null,
      editShape = null,
      me = this;

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

    L.Control.Draw.prototype.addTo.call(this, map);
    this._container.removeChild(this._container.childNodes[1]);
    //this._container.appendChild(L.DomUtil.create('div', 'leaflet-draw-section'));
  }
  /*,
  onAdd: function() {
    var container = L.DomUtil.create('div', 'leaflet-control-edit-overlays leaflet-bar');

    this._overlaysButton = this._createButton('+', 'Switch edit overlay', null, container, function() {

    }, this);
    this._saveButton = this._createButton('-', 'Zoom out', null, container, function() {

    }, this);
  },
  _createButton: function(html, title, clsName, container, handler, context) {
    var link = L.DomUtil.create('a', clsName, container),
      stop = L.DomEvent.stopPropagation;

    link.href = '#';
    link.innerHTML = html;
    link.title = title;

    L.DomEvent
      .on(link, 'click', stop)
      .on(link, 'mousedown', stop)
      .on(link, 'dblclick', stop)
      .on(link, 'click', L.DomEvent.preventDefault)
      .on(link, 'click', handler, context);

    return link;
  }
  */
});

L.Map.addInitHook(function() {
  if (this.options.editControl) {
    var featureGroup = new L.FeatureGroup(),
      options = {};

    if (typeof this.options.drawControl === 'object') {
      options = this.options.drawControl;
    }

    this.addLayer(featureGroup);
    options.edit = {
      edit: false,
      featureGroup: featureGroup,
      remove: false
    };
    this.editControl = L.npmap.control.edit(options).addTo(this);
  }
});

module.exports = function(options) {
  return new EditControl(options);
};
