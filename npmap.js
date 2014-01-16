/* global L */

var version = require('./package.json').version;

window.L.Icon.Default.imagePath = 'http://d1smq4hh6dg11v.cloudfront.net/npmap.js/' + version + '/images';

L.npmap = module.exports = {
  VERSION: version,
  control: {
    home: require('./src/control/home'),
    smallzoom: require('./src/control/smallzoom'),
    fullscreen: require('./src/control/fullscreen'),
    geocoder: require('./src/control/geocoder'),
    switcher: require('./src/control/switcher'),
    legend: require('./src/control/legend'),
    edit: require('./src/control/edit'),
    overview: require('./src/control/overview'),
    scale: require('./src/control/scale')
  },
  icon: {
    maki: require('./src/icon/maki'),
    npmaki: require('./src/icon/npmaki')
  },
  layer: {
    _cluster: require('./src/layer/cluster'),
    arcgisserver: {
      dynamic: require('./src/layer/arcgisserver/dynamic'),
      tiled: require('./src/layer/arcgisserver/tiled')
    },
    bing: require('./src/layer/bing'),
    csv: require('./src/layer/csv'),
    geojson: require('./src/layer/geojson'),
    github: require('./src/layer/github'),
    kml: require('./src/layer/kml'),
    mapbox: require('./src/layer/mapbox'),
    cartodb: require('./src/layer/cartodb'),
    tiled: require('./src/layer/tiled'),
    wms: require('./src/layer/wms')
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
