# NPMap.js

A JavaScript mapping library for the National Park Service, built as a Leaflet plugin. Includes functionality and a look-and-feel that fits into the strong graphic tradition of the National Park Service.

This is pre-alpha software - not production ready! NPMap.js will eventually take the place of the [NPMap JavaScript library](https://github.com/nationalparkservice/npmap).

## Building

    git clone https://github.com/nationalparkservice/npmap.git
    npm install
    make

This project uses [browserify](https://github.com/substack/node-browserify) to combine dependencies and installs a local copy when you run `npm install`. `make` will build NPMap.js in `dist/`.

## Credits

Heavily, cough cough, inspired by [MapBox.js](https://github.com/mapbox/mapbox.js). And, of course, built on the great [Leaflet](https://github.com/Leaflet/Leaflet) library. Standing on the shoulders of giants.

## Docs

None available yet, but will eventually live in `API.md`.

## Examples

Take a look in the `examples` directory. Again, not much there at the moment, but lots of examples coming soon.

[![Build Status](https://travis-ci.org/nationalparkservice/npmap.js.png)](https://travis-ci.org/nationalparkservice/npmap.js)