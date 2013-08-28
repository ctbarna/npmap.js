/* global L */

window.L = require('Leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://www.nps.gov/npmap/npmap.js/' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  layer: {
    arcgisserver: require('./src/layer/arcgisserver'),
    mapbox: require('./src/layer/mapbox'),
    tiled: require('./src/layer/tiled')
  },
  map: require('./src/map/map'),
  util: require('./src/util')
};