/* global L */

'use strict';

var json3 = require('json3'),
  reqwest = require('reqwest'),
  util = require('../util/util');

module.exports = {
  _backHtml: null,
  _clickResults: null,
  _toggleMenu: function toggleMenu(menu, e) {
    if (!menu.style.display || menu.style.display === 'none') {
      var toElement = e.toElement;

      menu.style.display = 'block';
      menu.style.left = toElement.offsetLeft + 'px';
      menu.style.top = (toElement.offsetTop + 18) + 'px';
    } else {
      menu.style.display = 'none';
    }
  },
  util: {
    boundsToExtent: function(bounds) {
      return {
        spatalReference: {
          wkid: 4326
        },
        xmax: bounds.getNorthEast().lng,
        xmin: bounds.getSouthWest().lng,
        ymax: bounds.getNorthEast().lat,
        ymin: bounds.getSouthWest().lat
      };
    },
    cleanUrl: function(url) {
      url = this.trim(url);

      if (url[url.length-1] !== '/') {
        url += '/';
      }

      return url;
    },
    debounce: function(fn, delay) {
      var timer = null;

      return function() {
        var context = this || context, args = arguments;

        clearTimeout(timer);

        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    },
    trim: function(str) {
      return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
  },
  _back: function() {
    this._map._popup.setContent(this._backHtml).update();
  },
  _createAction: function(cls, text, menuItems, actionsDiv) {
    var action = L.DomUtil.create('a', null);

    action.innerHTML = text;
    action.style.cssText = 'margin-left:5px;';

    if (menuItems) {
      var menu = L.DomUtil.create('ul', 'menu');

      for (var i = 0; i < menuItems.length; i++) {
        var a = L.DomUtil.create('a', null),
          item = menuItems[i],
          li = L.DomUtil.create('li', null);

        a.innerHTML = item.text;
        L.DomEvent.addListener(a, 'click', function() {
          menu.style.display = 'none';
          this.fn();
        }, item);
        li.appendChild(a);
        menu.appendChild(li);
      }

      actionsDiv.appendChild(menu);
      L.DomEvent.addListener(action, 'click' , function(e) {
        this._toggleMenu(menu, e);
      }, this);
    }

    return action;
  },
  _dataToHtml: function(data) {
    var html;

    if (this.options.popup) {
      switch (typeof this.options.popup) {
      case 'function':
        html = this.options.popup(data.attributes);
        break;
      case 'string':
        html = util.handlebars(this.options.popup, data.attributes);
        break;
      }
    } else {
      html = util._buildAttributeTable(data.value, data.attributes);
    }

    if (typeof html === 'string') {
      var div = L.DomUtil.create('div', null);
      div.innerHTML = html;
      return div;
    } else {
      return html;
    }
  },
  _getMetadata: function() {
    var me = this;

    reqwest({
      success: function(response) {
        if (!response.error) {
          var capabilities = response.capabilities;

          if (typeof capabilities === 'string') {
            if (capabilities.toLowerCase().indexOf('query') === -1) {
              me._hasInteractivity = false;
            }
          }

          me._metadata = response;
          //me.fire('metadata', response);
        }
      },
      type: 'jsonp',
      url: me._serviceUrl + '?f=json'
    });
  },
  _handleClick: function(latLng, layer, callback) {
    var me = this;

    me._clickResults = {};
    me.identify(latLng, function(response) {
      if (response) {
        var results = response.results;

        if (results && results.length) {
          var divLayer = L.DomUtil.create('div', 'layer'),
            divTitle = L.DomUtil.create('div', 'title'),
            i = 0,
            ul = L.DomUtil.create('ul', null);

          divTitle.innerHTML = me.options.name ? me.options.name : results[0].layerName;
          divLayer.appendChild(divTitle);

          for (i; i < results.length; i++) {
            var result = results[i],
              div = me._dataToHtml(result),
              li = L.DomUtil.create('li', null),
              link = L.DomUtil.create('a', null),
              value = result.value;

            link.setAttribute('data-layerid', result.layerId);
            link.setAttribute('data-objectid', result.attributes.OBJECTID);

            for (var j = 0; j < div.childNodes.length; j++) {
              var node = div.childNodes[j];

              if (L.DomUtil.hasClass(node, 'title')) {
                value = node.innerHTML;
                break;
              }
            }

            L.DomEvent.on(link, 'click', function() {
              me._more(this);
            });
            link.innerHTML = value;
            li.appendChild(link);
            ul.appendChild(li);
            me._clickResults[value] = div;
          }

          divLayer.appendChild(ul);
          callback(layer, divLayer);
        } else {
          callback(layer, null);
        }
      } else {
        callback(layer, null);
      }
    });
  },
  _more: function(el) {
    var actionsDiv = L.DomUtil.create('div', 'actions'),
      actionsUl = L.DomUtil.create('ul', null),
      addActions = [],
      back = L.DomUtil.create('a', null),
      div = L.DomUtil.create('div', null),
      me = this,
      popup = this._map._popup,
      subLayerId = el.getAttribute('data-layerid');

    div.appendChild(this._clickResults[el.innerHTML]);
    this._backHtml = popup.getContent();
    L.DomEvent.addListener(back, 'click', this._back, this);
    back.innerHTML = '&#171; Back';
    addActions.push(back);

    if (this.options.edit && this.options.edit.layers.split(',').indexOf(subLayerId) !== -1) {
      addActions.push(this._createAction('edit', 'Edit &#9656;', [{
        fn: function() {
          me.options.edit.handlers.editAttributes(parseInt(subLayerId, 10), parseInt(el.getAttribute('data-objectid'), 10));
        },
        text: 'Attributes'
      },{
        fn: function() {
          me.options.edit.handlers.editGeometry(parseInt(subLayerId, 10), parseInt(el.getAttribute('data-objectid'), 10));
        },
        text: 'Geometry'
      }], actionsDiv));
    }

    for (var i = 0; i < addActions.length; i++) {
      var li = L.DomUtil.create('li', null);
      li.appendChild(addActions[i]);
      actionsUl.appendChild(li);
    }

    actionsDiv.appendChild(actionsUl);
    div.appendChild(actionsDiv);
    popup.setContent(div).update();
  },
  _updateAttribution: function() {
    var map = this._map,
      bounds = map.getBounds(),
      include = [],
      zoom = map.getZoom();

    if (this.options.attribution) {
      this._map.attributionControl.removeAttribution(this.options.attribution);
    }

    for (var i = 0; i < this._dynamicAttributionData.length; i++) {
      var contributor = this._dynamicAttributionData[i];

      for (var j = 0; j < contributor.coverageAreas.length; j++) {
        var coverageArea = contributor.coverageAreas[j],
          coverageBounds = coverageArea.bbox;

        if (zoom >= coverageArea.zoomMin && zoom <= coverageArea.zoomMax) {
          if (bounds.intersects(L.latLngBounds(L.latLng(coverageBounds[0], coverageBounds[3]), L.latLng(coverageBounds[2], coverageBounds[1])))) {
            include.push(contributor.attribution);
            break;
          }
        }
      }
    }

    if (include.length) {
      this.options.attribution = include.join(', ');
      map.attributionControl.addAttribution(this.options.attribution);
    }
  },
  identify: function(latLng, callback) {
    var map = this._map,
      size = map.getSize(),
      params = {
        f: 'json',
        geometry: json3.stringify({
          spatialReference: {
            wkid: 4326
          },
          x: latLng.lng,
          y: latLng.lat
        }),
        //geometryPrecision
        geometryType: 'esriGeometryPoint',
        imageDisplay: size.x + ',' + size.y + ',96',
        layers: 'visible:' + this.getLayers().split(':')[1],
        mapExtent: json3.stringify(this.util.boundsToExtent(map.getBounds())),
        returnGeometry: false,
        sr: '4326',
        tolerance: 5
      };

    reqwest({
      data: params,
      error: function() {
        callback(null);
      },
      success: function(response) {
        callback(response);
      },
      type: 'jsonp',
      url: this._serviceUrl + '/identify'
    });
  }
};
