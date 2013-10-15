/* global L */
/* jslint node: true */
/* jshint camelcase: false */

'use strict';

module.exports = function (map) {
  var initialize = function () {
    // Add a click event to the map
    map.on('click', clickHandler, this);
    map.on('mousemove', mousemoveHandler, this);
  },
  popup = L.popup({
    maxHeight: (map.getContainer().offsetHeight - 86),
    maxWidth: (map.getContainer().offsetWidth - 95),
    minWidth: 221
  }),
  getQueryableLayers = function (e, callback) {
    // Loop through all the available layers and determine which ones are queryable
    var latLng = e.latlng.wrap();
    for (var layer in map._layers) {
      if (map._layers[layer]._handleClick && map._layers[layer]._isQueryable && map._layers[layer]._isQueryable(latLng)) {
        callback(map._layers[layer], layer, map._layers[layer]._isQueryable(latLng));
      }
    }
  },
  clickHandler = function(e) {
      // Create a container for the popum
      var popupDiv = L.DomUtil.create('div', 'content'),
      newLayerDiv,
      outerDiv,
      queryableLayers = false,
      latLng = e.latlng.wrap();
      popupDiv.setAttribute('id', 'current_popup');
      outerDiv = L.DomUtil.create('div');
      outerDiv.appendChild(popupDiv);
      popup.setContent(outerDiv.innerHTML).setLatLng(e.latlng);

      getQueryableLayers(e, function (layer, layerIndex, queryable) {
        var config = {};
        // Layer has the ability to handle a click
        if (!queryableLayers) {
          popup.openOn(map);
          queryableLayers = true;
        }
        newLayerDiv = L.DomUtil.create('div', 'popup_content');
        config.divName = 'layer_' + layerIndex;
        config.layer = layer;
        config.id = layerIndex;
        newLayerDiv.setAttribute('id', config.divName);
        newLayerDiv.textContent = "Waiting...";
        L.DomUtil.get('current_popup').appendChild(newLayerDiv);

        // Call the function
        layer._handleClick(latLng, config, drawLayer);
      });
  },
  mousemoveHandler = function (e) {
    var latLng = e.latlng.wrap();
    map._container.style.cursor = 'default';
    getQueryableLayers(e, function(layer, layerIndex, queryable) {
      var setCursor = function (setting) {
        setting = (setting && setting.Error) ? {'cursor': 'default'} : setting;
        map._container.style.cursor = (setting && setting.cursor) ? setting.cursor : 'pointer';
      };
      setCursor(queryable);
      layer._handleMousemove(latLng, setCursor);
    });
  },
  drawLayer =  function (layerData, config) {
      var layerDiv,
        layerName = 'Layer: ' + config.layer;
      layerName = config.layer.options ? config.layer.options.id || layerName : layerName;

      if (layerData) {
        var layerTitle = L.DomUtil.create('div'),
        resultsTable = L.DomUtil.create('table'),
        resultsTableBody = L.DomUtil.create('tbody');
        layerDiv = L.DomUtil.create('div');

        layerTitle.setAttribute('class', 'title');
        layerTitle.setAttribute('style', 'margin-top:10px;');
        layerTitle.textContent = layerName;

        for (var fieldName in layerData) {
          var tableRow = L.DomUtil.create('tr');
          tableRow.setAttribute('class', 'hoverable');
          var tableField = L.DomUtil.create('td');
          tableField.textContent = fieldName;
          tableRow.appendChild(tableField);
          var tableData = L.DomUtil.create('td');
          tableData.textContent = layerData[fieldName];
          tableRow.appendChild(tableData);
          resultsTableBody.appendChild(tableRow);
        }
        resultsTable.appendChild(resultsTableBody);
        layerDiv.appendChild(layerTitle);
        layerDiv.appendChild(resultsTable);
        L.DomUtil.get(config.divName).textContent = '';
        L.DomUtil.get(config.divName).appendChild(layerDiv);
      }

  };
  initialize();
};
