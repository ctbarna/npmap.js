/* global L */

window.L = require('Leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://www.nps.gov/npmap/npmap.js/v' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  layer: {
    //cartodb: require('./src/layer/cartodb'),
    //geojson: require('./src/layer/geojson'),
    mapbox: require('./src/layer/mapbox')
  },
  map: require('./src/map/map')
};