/* global L */

'use strict';

var geocode = require('../util/geocode'),
  reqwest = require('reqwest'),
  util = require('../util/util');

var GeocoderControl = L.Control.extend({
  options: {
    position: 'topright',
    provider: 'esri'
  },
  statics: {
    ATTRIBUTIONS: {
      BING: 'Geocoding by Microsoft',
      ESRI: 'Geocoding by Esri',
      MAPQUEST: 'Geocoding by MapQuest',
      NOMINATIM: [
        'Geocoding by Nominatim',
        '&copy; <a href=\'http://openstreetmap.org/copyright\'>OpenStreetMap</a> contributors'
      ]
    }
  },
  initialize: function(options) {
    L.Util.extend(this.options, options);
    return this;
  },
  _checkScroll: function() {
    if (this._selected) {
      var top = util.getPosition(this._selected).top,
        bottom = top + util.getOuterDimensions(this._selected).height,
        scrollTop = this._ul.scrollTop,
        visible = [
          scrollTop,
          scrollTop + util.getOuterDimensions(this._ul).height
        ];

      if (top < visible[0]) {
        this._ul.scrollTop = top - 10;
      } else if (bottom > visible[1]) {
        this._ul.scrollTop = top - 10;
      }
    }
  },
  _clearResults: function() {
    this._ul.innerHTML = '';
    this._ul.scrollTop = 0;
    this._ul.style.display = 'none';
    this._input.setAttribute('aria-activedescendant', null);
    this._input.setAttribute('aria-expanded', false);
    this._selected = null;
    this._oldValue = '';
  },
  _geocodeRequest: function() {
    var value = this._input.value;

    if (value.length) {
      var icon = this._button.childNodes[0],
        me = this;

      me._clearResults();
      L.DomEvent.off(me._button, 'click', me._geocodeRequest);
      L.DomUtil.removeClass(icon, 'icon-search');
      L.DomUtil.addClass(icon, 'icon-working-black');
      L.DomUtil.addClass(me._button, 'working');
      geocode[me.options.provider](value, function(result) {
        L.DomEvent.on(me._button, 'click', me._geocodeRequest, me);
        L.DomUtil.removeClass(icon, 'icon-working-black');
        L.DomUtil.addClass(icon, 'icon-search');
        L.DomUtil.removeClass(me._button, 'working');

        if (result && result.success) {
          if (result.results && result.results.length) {
            me._map.fitBounds(result.results[0].bounds);
          } else {
            if (result.message) {
              //NPMap.Map.notify(response.message, null, 'info');
            } else {
              //NPMap.Map.notify('That location could not be found.', null, 'info');
            }
          }
        } else {
          //NPMap.Map.notify(response.message, null, 'error');
        }
      });
    }
  },
  _handleSelect: function(li) {
    var id = li.id;

    this._clearResults();
    this._isDirty = false;
    this._input.value = this._oldValue = id;
    this._input.focus();
    this._map.fitBounds(this._bounds[id]);
    this._input.setAttribute('aria-activedescendant', id);
  },
  _inputOnFocus: function() {
    var me = this;

    reqwest({
      jsonpCallbackName: 'callback',
      success: function(response) {
        me._bounds = {};
        me._oldValue = me._input.value;

        for (var key in response) {
          var value = response[key];

          if (value) {
            me._bounds[key] = [
              [value[2], value[3]],
              [value[1], value[0]]
            ];
          }
        }

        L.DomEvent.on(me._input, 'keyup', function(e) {
          var value = this.value;

          if (value) {
            var keyCode = e.keyCode;

            if (keyCode !== 13 && keyCode !== 27 && keyCode !== 38 && keyCode !== 40) {
              if (value !== me._oldValue) {
                me._isDirty = true;
                me._oldValue = value;

                if (value.length) {
                  var results = [];

                  for (var key in me._bounds) {
                    if (key.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                      results.push({
                        b: me._bounds[key],
                        d: key
                      });
                    }
                  }

                  if (results.length > 0) {
                    me._clearResults();

                    for (var i = 0; i < results.length; i++) {
                      var d = results[i].d,
                        j = d.toLowerCase().indexOf(value.toLowerCase()),
                        li = L.DomUtil.create('li', null, me._ul);

                      li.id = d;
                      li.innerHTML = (d.slice(0, j) + '<strong>' + d.slice(j, j + value.length) + '</strong>' + d.slice(j + value.length));
                      L.DomEvent.on(li, 'click', function() {
                        me._handleSelect(this);
                      });
                    }

                    me._ul.style.display = 'block';
                    me._input.setAttribute('aria-expanded', true);
                  } else {
                    me._clearResults();
                  }
                }
              }
            }
          } else {
            me._clearResults();
          }
        });
        L.DomEvent.on(me._input, 'keydown', function(e) {
          switch (e.keyCode) {
          case 13:
            if (me._selected) {
              me._handleSelect(me._selected);
            } else {
              me._geocodeRequest();
            }
            break;
          case 27:
            // Escape
            me._clearResults();
            break;
          case 38:
            // Up
            if (me._ul.style.display === 'block') {
              if (me._selected) {
                L.DomUtil.removeClass(me._selected, 'selected');
                me._selected = util.getPreviousSibling(me._selected);
              }

              if (!me._selected) {
                me._selected = me._ul.childNodes[me._ul.childNodes.length - 1];
              }

              L.DomUtil.addClass(me._selected, 'selected');
              me._checkScroll();
            }

            L.DomEvent.preventDefault(e);
            break;
          case 40:
            // Down
            if (me._ul.style.display === 'block') {
              if (me._selected) {
                L.DomUtil.removeClass(me._selected, 'selected');
                me._selected = util.getNextSibling(me._selected);
              }

              if (!me._selected) {
                me._selected = me._ul.childNodes[0];
              }

              L.DomUtil.addClass(me._selected, 'selected');
              me._checkScroll();
            }

            L.DomEvent.preventDefault(e);
            break;
          }
        });
      },
      type: 'jsonp',
      url: 'http://www.nps.gov/npmap/data/park-bounds.js'
    });
    L.DomEvent.off(me._input, 'focus', me._inputOnFocus);
    delete me._inputOnFocus;
  },
  onAdd: function(map) {
    var attribution = GeocoderControl.ATTRIBUTIONS[this.options.provider.toUpperCase()],
      container = L.DomUtil.create('div', 'leaflet-control-geocoder'),
      button = this._button = L.DomUtil.create('button', null, container),
      input = this._input = L.DomUtil.create('input', null, container),
      stop = L.DomEvent.stop,
      stopPropagation = L.DomEvent.stopPropagation,
      ul = this._ul = L.DomUtil.create('ul', 'leaflet-control', container);

    L.DomEvent
      .on(button, 'click', stop)
      .on(button, 'click', this._geocodeRequest, this)
      .on(button, 'dblclick', stopPropagation)
      .on(button, 'mousedown', stopPropagation)
      .on(input, 'click', stop)
      .on(input, 'dblclick', stopPropagation)
      .on(input, 'focus', function() {
        this.value = this.value;
      })
      .on(input, 'focus', this._inputOnFocus, this)
      .on(input, 'mousedown', stopPropagation)
      .on(input, 'mousewheel', stopPropagation)
      .on(ul, 'click', stop)
      .on(ul, 'dblclick', stopPropagation)
      .on(ul, 'mousedown', stopPropagation)
      .on(ul, 'mousewheel', stopPropagation);

    button.innerHTML = '<i class="icon-search"></i>';
    button.title = 'Search';
    input.setAttribute('aria-activedescendant', null);
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', false);
    input.setAttribute('aria-label', 'Geocode');
    input.setAttribute('aria-owns', 'geocoder_listbox');
    input.setAttribute('placeholder', 'Find a location');
    input.setAttribute('role', 'combobox');
    input.setAttribute('type', 'text');
    ul.setAttribute('id', 'geocoder_listbox');
    ul.setAttribute('role', 'listbox');

    if (attribution) {
      if (L.Util.isArray(attribution)) {
        for (var i = 0; i < attribution.length; i++) {
          map.attributionControl.addAttribution(attribution[i]);
        }
      } else {
        map.attributionControl.addAttribution(attribution);
      }
    }

    return container;
  },
  onRemove: function(map) {
    var attribution = GeocoderControl.ATTRIBUTIONS[this.options.provider.toUpperCase()];

    if (attribution) {
      if (L.Util.isArray(attribution)) {
        for (var i = 0; i < attribution.length; i++) {
          map.attributionControl.removeAttribution(attribution[i]);
        }
      } else {
        map.attributionControl.removeAttribution(attribution);
      }
    }
  }
});

L.Map.mergeOptions({
  geocoderControl: false
});
L.Map.addInitHook(function() {
  if (this.options.geocoderControl) {
    var options = {};

    if (typeof this.options.geocoderControl === 'object') {
      options = this.options.geocoderControl;
    }

    this.geocoderControl = L.npmap.control.geocoder(options).addTo(this);
  }
});

module.exports = function(options) {
  return new GeocoderControl(options);
};
