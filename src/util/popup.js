/* global L */
/* jshint camelcase: false */

'use strict';

module.exports = function popup(map, latLng) {
  var layers = [],
    totalLayers = 1, //Object.keys(map._layers).length,
    addLayer =  function addLayer(layer, layerData) {
      var layerOrder = layer._leaflet_id,
        layerName = ['Layer #:', layerOrder].join(),
        layerDiv;
      layerName = layer.options ? layer.options.id || layerName : layerName;

      if (layerData) {
        var layerTitle = document.createElement('div'),
        resultsTable = document.createElement('table'),
        resultsTableBody = document.createElement('tbody');
        layerDiv = document.createElement('div');

        layerTitle.setAttribute('class', 'title');
        layerTitle.setAttribute('style', 'margin-top:10px;');
        layerTitle.textContent = [layerName, ' (', layerData.length || 0, ')'].join('');

        for (var fieldName in layerData) {
          var tableRow = document.createElement('tr');
          tableRow.setAttribute('class', 'hoverable');
          var tableField = document.createElement('td');
          tableField.textContent = fieldName;
          tableRow.appendChild(tableField);
          var tableData = document.createElement('td');
          tableData.textContent = layerData[fieldName];
          tableRow.appendChild(tableData);
          resultsTableBody.appendChild(tableRow);
        }
        resultsTable.appendChild(resultsTableBody);
        layerDiv.appendChild(layerTitle);
        layerDiv.appendChild(resultsTable);
      }
      layers.push({
        'name': layerName,
        'el': layerDiv,
        'order': layerOrder
      });
      _checkIfFinished();
    },
    _checkIfFinished = function _checkFinished() {
      if (layers.length === totalLayers) _show();
    },
    _sortByOrder = function _sortByOrder(a,b){
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return 0;
    },
    _show = function show() {
      var popupDiv = document.createElement('div'),
        sortedLayers = layers.sort(_sortByOrder);

      for (var sortedLayer in sortedLayers) {
        if (sortedLayers[sortedLayer].el) popupDiv.appendChild(sortedLayers[sortedLayer].el);
      }
      _popup.setContent(popupDiv.outerHTML).setLatLng(latLng).openOn(map);
    },
    _popup = L.popup({
      maxHeight: (map.getContainer().offsetHeight - 86),
      maxWidth: (map.getContainer().offsetWidth - 95),
      minWidth: 221
    });

  return ({
    addLayer: addLayer
  });
};
