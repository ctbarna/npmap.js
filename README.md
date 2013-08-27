# NPMap.js

A JavaScript mapping library for the National Park Service, built as a Leaflet plugin. Includes functionality and a look-and-feel that fits into the strong graphic tradition of the National Park Service.

This is pre-alpha software - not production ready! NPMap.js will eventually take the place of the [NPMap JavaScript library](https://github.com/nationalparkservice/npmap).

## Building

    git clone https://github.com/nationalparkservice/npmap.git
    npm install
    make

This project uses [browserify](https://github.com/substack/node-browserify) to combine dependencies and installs a local copy when you run `npm install`. `make` will build NPMap.js in `dist/`.

## Credits

Heavily inspired (cough cough) by [MapBox.js](https://github.com/mapbox/mapbox.js), and, of course, built on the great [Leaflet](https://github.com/Leaflet/Leaflet) library. Standing on the shoulders of giants.

## Docs

None available yet, but will eventually live in `API.md`.

## Examples

Take a look in the `examples` directory. Again, not much there at the moment, but lots of examples coming soon.

Each example that is there has two versions: An "api" version and a "bootstrap" version. This reflects the different ways NPMap.js can be used:

1. If you have control of the web page you are embedding the map into and want to build your map with a traditional API, you should manually include `npmap.js`, along with the required CSS files, in your HTML and then build the map using the API.
2. If you want a simplified way of building your map and/or don't have control over the web page you are embedding your map into, you should create a config object and then load `npmap-bootstrap.js` into your web page dynamically. The bootstrap script will take care of loading all the JavaScript and CSS dependencies for you.

[![Build Status](https://travis-ci.org/nationalparkservice/npmap.js.png)](https://travis-ci.org/nationalparkservice/npmap.js)