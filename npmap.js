window.L = require('Leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://www.nps.gov/npmap/npmap.js/v' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  mapboxLayer: require('./src/mapbox-layer'),
  map: require('./src/map')
};