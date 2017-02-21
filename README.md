<p align="center">
  <img src="http://www.nps.gov/npmap/img/nps-arrowhead-medium.png" alt="NPS Arrowhead">
</p>

# NPMap.js

Extends [Leaflet](http://leafletjs.com) to include functionality and a look-and-feel built specifically for the National Park Service.

This is beta software. Feel free to play around, but keep this in mind -- and please help test and [report issues](https://github.com/nationalparkservice/npmap.js/issues).

NPMap.js will eventually take the place of the [NPMap JavaScript library](https://github.com/nationalparkservice/npmap).

## Thanks

Heavily inspired (cough cough) by [MapBox.js](https://github.com/mapbox/mapbox.js), and, of course, built on the great [Leaflet](http://leafletjs.com) library. Standing on the shoulders of giants.

## Versioning

NPMap.js is versioned using [semantic versioining](http://semver.org). This means that releases are numbered: `major.minor.patch` and follow these guidelines:

- Breaking backward compatibility bumps the major (and resets the minor and patch to zero)
- New additions that don't break backward compatibility bumps the minor (and resets the patch to zero)
- Bug fixes and miscellaneous changes bumps the patch

## Changelog

- [v1.1.0](https://github.com/nationalparkservice/npmap.js/issues?milestone=1&page=1&state=closed): Under Development

## Hosted Version

NPMap.js is hosted on the National Park Service's content delivery network. Feel free to load the library directly from there. You can access hosted versions at http://www.nps.gov/npmap/npmap.js/major.minor.patch/. You should replace "major.minor.patch" with the number of the version you want to access.

## Building

You must have [node.js](http://nodejs.org/) installed to run the build. After installing node.js:

    git clone https://github.com/nationalparkservice/npmap.js.git
    cd npmap.js
    npm install

Then use [Grunt](http://gruntjs.com/) to build the library:

    grunt build

Internally, the Grunt task uses [browserify](https://github.com/substack/node-browserify) to combine dependencies. It is installed locally, along with other required packages, when you run `npm install`. The build task also uses [uglify](https://github.com/gruntjs/grunt-contrib-uglify) and [cssmin](https://npmjs.org/package/grunt-contrib-cssmin) to create minified versions in `dist/`.

## Testing

NPMap.js uses the [Mocha](http://mochajs.org/) JavaScript test framework and [PhantomJS](http://phantomjs.org/) to run the tests. You can run the tests with the following command:

    grunt test

## Documentation

Take a look at [API.md](https://github.com/nationalparkservice/npmap.js/blob/master/API.md). Ignore the random notes at the bottom; they will be cleaned up and turned into complete thoughts soon.

## Examples

Simple and targeted examples reside in the `examples` directory.

Some of the examples have two versions: a version with `-api` at the end of the file name and a version with `-bootstrap` at the end of the file name. This reflects the two different ways NPMap.js can be used:

1. Like "traditional" mapping APIs. This works well if you are familiar with JavaScript *and* have access to include JavaScript and CSS files in the web page your map is going to be included in. These examples use `npmap.js` directly, and utilize the [API](https://github.com/nationalparkservice/npmap.js/blob/master/API.md) to build the map.
2. Indirectly, through the use of `bootstrap.js`. This allows you to configure your map using the `NPMap` variable. This is the recommended approach for non-technical users and/or those who don't have access to the web page the map is going to be included in (which is the case if you are using the National Park Service content management system). This is also the approach used by the [NPMap Builder](https://github.com/nationalparkservice/npmap-builder).

## Support

You can get in touch with the NPMap team by contacting us via Twitter ([@npmap](http://twitter.com/npmap)) or email ([npmap@nps.gov](mailto:npmap@nps.gov)). We are happy to help with any questions, and feedback is welcome as well!

## Code Status

[![Build Status](https://travis-ci.org/nationalparkservice/npmap.js.png)](https://travis-ci.org/nationalparkservice/npmap.js)
[![Dependencies](https://david-dm.org/nationalparkservice/npmap.js
.png)](https://david-dm.org/nationalparkservice/npmap.js#info=dependencies&view=table)
[![Dev Dependencies](https://david-dm.org/nationalparkservice/npmap.js/dev-status.png)](https://david-dm.org/nationalparkservice/npmap.js#info=devDependencies&view=table)
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
