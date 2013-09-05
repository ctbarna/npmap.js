<p align="center">
  <img src="http://www.nps.gov/npmap/img/nps-arrowhead-medium.png" alt="NPS Arrowhead">
</p>

# NPMap.js

A JavaScript mapping library for the National Park Service, built as a Leaflet plugin. Includes functionality and a look-and-feel that fits into the graphic tradition of the National Park Service.

This is pre-alpha software that is **nowhere close to production ready**. Play around if you'd like, but keep this in mind. NPMap.js will eventually take the place of the [NPMap JavaScript library](https://github.com/nationalparkservice/npmap).

## Building

The build process uses [node.js](http://nodejs.org/). After installing node.js:

    git clone https://github.com/nationalparkservice/npmap.js.git
    cd npmap.js
    npm install
    make

The [browserify](https://github.com/substack/node-browserify) package is used to combine dependencies. It, along with other required packages, are installed locally when you run `npm install`. Running `make` will build NPMap.js, using [UglifyJS](https://github.com/mishoo/UglifyJS) to create minified versions, in `dist/`.

## Hosted Version

NPMap.js is hosted on the National Park Service's content delivery network. Feel free to load the library directly from there. You can access hosted versions at http://www.nps.gov/npmap/dev/tools/npmap.js/x.y.z/. You should replace "x.y.z" with the number of the version you want to access.

## Credits

Heavily inspired (cough cough) by [MapBox.js](https://github.com/mapbox/mapbox.js), and, of course, built on the great [Leaflet](https://github.com/Leaflet/Leaflet) library. Standing on the shoulders of giants.

## Docs

Take a look at [API.md](https://github.com/nationalparkservice/npmap.js/blob/master/API.md). Ignore the random notes at the bottom; they will be cleaned up and turned into complete thoughts soon.

## Examples

Take a look in the `examples` directory. Again, not much there at the moment, but more coming soon.

Most of the examples have two versions: a version with `-api` at the end of the name and a version with `-bootstrap` at the end of the name. This reflects the two different ways NPMap.js can be used:

1. Like "traditional" mapping APIs. This works well if you are familiar with JavaScript *and* have access to include JavaScript and CSS files in the web page your map is going to be included in. These examples use `npmap.js` directly, and utilize the [API](https://github.com/nationalparkservice/npmap.js/blob/master/API.md) to build the map.
2. Indirectly, through the use of `bootstrap.js`. This allows you to configure your map using the `NPMap.config` property. This is the recommended approach for non-technical users or those who don't have access to the web page the map is going to be included in.

[![Build Status](https://travis-ci.org/nationalparkservice/npmap.js.png)](https://travis-ci.org/nationalparkservice/npmap.js)