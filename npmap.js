/* global L */

window.L = require('leaflet/dist/leaflet-src');
window.L.Icon.Default.imagePath = 'http://www.nps.gov/npmap/npmap.js/' + require('./package.json').version + '/images';

L.npmap = module.exports = {
  VERSION: require('./package.json').version,
  control: {
    fullscreen: require('./src/control/fullscreen'),
    geocoder: require('./src/control/geocoder'),
    home: require('./src/control/home'),
    overview: require('./src/control/overview'),
    scale: require('./src/control/scale'),
    smallzoom: require('./src/control/smallzoom'),
    switcher: require('./src/control/switcher')
  },
  icon: {
    maki: require('./src/icon/maki'),
    npmaki: require('./src/icon/npmaki')
  },
  layer: {
    _cluster: require('./src/layer/cluster'),
    arcgisserver: require('./src/layer/arcgisserver'),
    csv: require('./src/layer/csv'),
    geojson: require('./src/layer/geojson'),
    github: require('./src/layer/github'),
    kml: require('./src/layer/kml'),
    mapbox: require('./src/layer/mapbox'),
    cartodb: require('./src/layer/cartodb'),
    tiled: require('./src/layer/tiled')
  },
  map: require('./src/map'),
  preset: {
    baselayers: require('./src/preset/baselayers.json'),
    colors: require('./src/preset/colors.json'),
    layers: require('./src/preset/overlays.json')
  },
  tooltip: require('./src/tooltip'),
  util: {
    _: require('./src/util/util'),
    topojson: require('./src/util/topojson')
  }
};
