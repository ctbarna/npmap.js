/* global L */

'use strict';

var json3 = require('json3'),
  reqwest = require('reqwest'),
  util = require('../util/util');

module.exports = {
  _backHtml: null,
  _clickResults: null,
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

          divTitle.textContent = me.options.name ? me.options.name : results[0].layerName;
          divLayer.appendChild(divTitle);

          for (i; i < results.length; i++) {
            var div = me._dataToHtml(results[i]),
              li = L.DomUtil.create('li', null),
              link = L.DomUtil.create('a', null),
              value = results[i].value;

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
            link.textContent = value;
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
      popup = this._map._popup;

    // Need to get layerId and ObjectID

    div.appendChild(this._clickResults[el.innerHTML]);
    this._backHtml = popup.getContent();
    L.DomEvent.addListener(back, 'click', this._back, this);
    back.innerHTML = '« Back';
    addActions.push(back);

    if (this.options.edit) {
      var edit = L.DomUtil.create('a', null),
        menu = L.DomUtil.create('div', 'menu edit');

      function toggleEditMenu(e) {
        console.log(e);

        if (!menu.style.display || menu.style.display === 'none') {
          var toElement = e.toElement;

          menu.style.display = 'block';
          menu.style.left = toElement.offsetLeft + 'px';
          menu.style.top = (toElement.offsetTop + 18) + 'px';
        } else {
          menu.style.display = 'none';
        }
      }

      edit.innerHTML = 'Edit &#9656;';
      edit.style.cssText = 'margin-left:5px;';
      addActions.push(edit);
      menu.innerHTML = '<ul><li><a>Attributes</a></li><li><a>Geometry</a></li></ul>';
      actionsDiv.appendChild(menu);
      L.DomEvent.addListener(edit, 'click' , toggleEditMenu);
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
