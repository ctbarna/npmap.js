# NPMap.js

A JavaScript mapping library for the National Park Service, built as a Leaflet plugin. Includes functionality and a look-and-feel that fits into the strong graphic tradition of the National Park Service.

This is pre-alpha software - not production ready! NPMap.js will eventually take the place of the [NPMap JavaScript library](https://github.com/nationalparkservice/npmap).

## Building

    git clone https://github.com/nationalparkservice/npmap.git
    npm install
    make

This project uses [browserify](https://github.com/substack/node-browserify) to combine dependencies and installs a local copy when you run `npm install`. `make` will build NPMap.js in `dist/`.

## Credits

Heavily inspired (cough, cough) by [MapBox.js](https://github.com/mapbox/mapbox.js), and, of course, built on the great [Leaflet](https://github.com/Leaflet/Leaflet) library. Standing on the shoulders of giants.

## Docs

None available yet, but will eventually live in `API.md`.

## Examples

Take a look in the `examples` directory. Again, not much there at the moment, but lots of examples coming soon.

Each example has two versions, an "api" version and a "bootstrap" version. This is because there are two different ways to use NPMap.js:

- If you have control of the web page you are embedding the map into and you are want a more traditional way of building your map, you should include npmap.js, along with the required CSS files, in your web page and then build the map using the API.
- If, however, you want a simplified way of building a web map and/or don't have control over the web page you are embedding your map into, you should create a config object and then load "npmap-bootstrap.js" into your web page dynamically.

[![Build Status](https://travis-ci.org/nationalparkservice/npmap.js.png)](https://travis-ci.org/nationalparkservice/npmap.js)