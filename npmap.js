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
    geojson: require('./src/layer/geojson'),
    github: require('./src/layer/github'),
    mapbox: require('./src/layer/mapbox'),
    cartodb: require('./src/layer/cartodb'),
    tiled: require('./src/layer/tiled')
  },
  map: require('./src/map/map'),
  preset: {
    colors: require('./src/preset/colors.json'),
    icons: require('./src/preset/icons.json'),
    layers: require('./src/preset/layers.json')
  },
  util: {
    _: require('./src/util/util'),
    geojson: require('./src/util/geojson'),
    topojson: require('./src/util/topojson')
  }
};
