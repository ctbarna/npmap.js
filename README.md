# NPMap.js

[![Build Status](https://travis-ci.org/nationalparkservice/npmap.js.png)](https://travis-ci.org/nationalparkservice/npmap.js)

A JavaScript mapping library for the National Park Service, built as a Leaflet plugin. Currently working on v1 here - not production ready! This will eventually take the place of the [NPMap JavaScript library](https://github.com/nationalparkservice/npmap).

## Building

    git clone https://github.com/nationalparkservice/npmap.git
    npm install
    make

This project uses [browserify](https://github.com/substack/node-browserify) to combine dependencies and installs a local copy when you run `npm install`. `make` will build the project in `dist/`.

## Credits

Heavily, cough, inspired by [MapBox.js](https://github.com/mapbox/mapbox.js). And, of course, built on the great [Leaflet](https://github.com/Leaflet/Leaflet) library. Standing on the shoulders of giants.