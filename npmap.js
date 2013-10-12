/* global L */

window.L = require('leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://www.nps.gov/npmap/npmap.js/' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  control: {
    fullscreen: require('./src/control/fullscreen'),
    overview: require('./src/control/overview'),
    scale: require('./src/control/scale'),
    smallzoom: require('./src/control/smallzoom'),
    switcher: require('./src/control/switcher')
  },
  layer: {
    arcgisserver: require('./src/layer/arcgisserver'),
    github: require('./src/layer/github'),
    mapbox: require('./src/layer/mapbox'),
    tiled: require('./src/layer/tiled')
  },
  map: require('./src/map/map'),
  util: {
    _: require('./src/util/util'),
    geojson: require('./src/util/geojson'),
    topojson: require('./src/util/topojson'),
    popup: require('./src/util/popup.js')
  }
};
