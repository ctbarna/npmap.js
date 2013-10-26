/* global L */
/* jshint camelcase: false */
/* jslint node: true */

'use strict';

var mustache = require('mustache'),
    util = require('../util/util');

module.exports = function(map) {
  var completed = 0,
      divInner = L.DomUtil.create('div', 'content'),
      divOuter = L.DomUtil.create('div', null),
      popup = L.popup({
        autoPanPadding: L.point(48, 20), // autoPanPadding: L.bounds(L.point(45, 20), L.point(20, 20)) https://github.com/Leaflet/Leaflet/issues/1588
        maxHeight: (map.getContainer().offsetHeight - 86),
        //maxWidth: (map.getContainer().offsetWidth - 95),
        maxWidth: 221,
        minWidth: 221,
        offset: L.point(0, -2)
      });

  divOuter.appendChild(divInner);

  function handler(e) {
    var latLng = e.latlng.wrap(),
        queryable = getQueryableLayers(latLng);

    if (queryable.length) {
      var interval;

      completed = 0;
      divInner.innerHTML = '';

      for (var i = 0; i < queryable.length; i++) {
        var layer = queryable[i];

        layer._handleClick(latLng, layer, drawLayerResult);
      }

      // TODO: Add support for a timeout so the infobox displays even if one or more operations fail.
      interval = setInterval(function() {
        if (queryable.length === completed) {
          var html = divOuter.innerHTML;

          clearInterval(interval);
          
          if (html.length) {
            popup.setContent(html).setLatLng(latLng).openOn(map);
          }
        }
      }, 10);
    }
  }
  function drawLayerResult(layer, data) {
    if (data) {
      var divLayer = L.DomUtil.create('div', 'layer_content'),
          html;

      // TODO: Shouldn't NPMap.js store the layer popup at layer._popup?
      if (layer.options.popup) {
        if (typeof layer.options.popup === 'function') {
          html = layer.options.popup(data);
        } else if (typeof layer.options.popup === 'string') {
          html = mustache.render(layer.options.popup, data);
        }
      } else {
        // TODO: Shouldn't NPMap.js store the layer name at layer._name? Also... hoverable needs to be cleaner.
        var hoverable = layer.options.type === 'arcgisserver',
            name = layer.options.name || 'Layer: ' + layer._leaflet_id;

        html = util.getOuterHtml(drawTable(name, data, hoverable));
      }

      divLayer.innerHTML = html;
      divInner.appendChild(divLayer);
    }

    completed++;
  }
  function drawTable(name, data, hoverable) {
    var divLayer = L.DomUtil.create('div', null);

    if (!L.Util.isArray(data)) {
      data = [data];
    }

    for (var index in data) {
      var dataLayer = data[index],
          divTitle = L.DomUtil.create('div', null),
          tableResults = L.DomUtil.create('table', null),
          tableResultsBody = L.DomUtil.create('tbody', null);

      divTitle.setAttribute('class', 'title');
      divTitle.setAttribute('style', 'margin-top:10px;');
      divTitle.textContent = name;

      for (var fieldName in dataLayer) {
        var tableData = L.DomUtil.create('td', null),
            tableField = L.DomUtil.create('td', null),
            tableRow = L.DomUtil.create('tr');

        if (hoverable) {
          tableRow.setAttribute('class', 'hoverable');
        }

        tableField.textContent = fieldName;
        tableRow.appendChild(tableField);
        tableData.textContent = dataLayer[fieldName];
        tableRow.appendChild(tableData);
        tableResultsBody.appendChild(tableRow);
      }

      tableResults.appendChild(tableResultsBody);
      divLayer.appendChild(divTitle);
      divLayer.appendChild(tableResults);
    }

    return divLayer;
  }
  function getQueryableLayers(latLng) {
    var queryable = [];

    for (var layerId in map._layers) {
      var layer = map._layers[layerId];

      if (layer.options.popup !== false) {
        if (typeof layer._handleClick === 'function' && layer._isQueryable && layer._isQueryable(latLng)) {
          queryable.push(layer);
        }
      }
    }

    return queryable;
  }

  map.on('click', handler);
};
