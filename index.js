window.L = require('Leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://api.tiles.mapbox.com/mapbox.js/' + 'v' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  map: require('./src/map')
};