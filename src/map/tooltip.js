/* global L */
/* jshint camelcase: false */
/* jslint node: true */

'use strict';

var mustache = require('mustache'),
    util = require('../util/util');

module.exports = function(map) {
  function draw(layer, data) {
    if (data) {
      setCursor('pointer');

      if (layer.options.tooltip) {
        var html;

        switch (typeof layer.options.tooltip) {
          case 'function':
            html = layer.options.tooltip(data);
            break;
          case 'string':
            html = mustache.render(layer.options.tooltip, data);
            break;
        }

        if (html && html.length) {
          // Show tooltip.
          //console.log(html);
        }
      }
    }
  }
  function getQueryableLayers(latLng) {
    var queryable = [];

    for (var layerId in map._layers) {
      var layer = map._layers[layerId];

      if (typeof layer._handleMousemove === 'function' && layer._isQueryable && layer._isQueryable(latLng)) {
        queryable.push(layer);
      }
    }

    return queryable;
  }
  function handler(e) {
    var latLng = e.latlng.wrap(),
        queryable = getQueryableLayers(latLng);

    map._container.style.cursor = 'default';

    if (queryable.length) {
      for (var i = 0; i < queryable.length; i++) {
        var layer = queryable[i];

        layer._handleMousemove(latLng, layer, draw);
      }
    }
  }
  function hideTooltip() {

  }
  function setCursor(type) {
    map._container.style.cursor = type;
  }

  map.on('click', function() {
    hideTooltip();
  });
  map.on('mousemove', handler);
};
