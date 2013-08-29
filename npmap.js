/* global L */

window.L = require('Leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://www.nps.gov/npmap/npmap.js/' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  control: {
    navigation: require('./src/control/navigation')
  },
  layer: {
    arcgisserver: require('./src/layer/arcgisserver'),
    github: require('./src/layer/github'),
    mapbox: require('./src/layer/mapbox'),
    tiled: require('./src/layer/tiled')
  },
  map: require('./src/map/map'),
  util: {
    _: require('./src/util/util')
  }
};