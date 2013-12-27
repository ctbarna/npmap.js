/* globals L */
/* jshint camelcase: false */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

module.exports = ({
  _formatBingResult: function(result) {
    var bbox = result.bbox,
      coordinates = result.geocodePoints[0].coordinates;

    return {
      bounds: [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]]
      ],
      latLng: [coordinates[0], coordinates[1]],
      name: result.name
    };
  },
  _formatEsriResult: function(result) {
    var extent = result.extent,
      geometry = result.feature.geometry;

    return {
      bounds: [
        [extent.ymin, extent.xmin],
        [extent.ymax, extent.xmax]
      ],
      latLng: [geometry.y, geometry.x],
      name: result.name
    };
  },
  _formatMapquestResult: function(result) {
    var city = result.adminArea5 || null,
      county = result.adminArea4 || null,
      country = result.adminArea1 || null,
      postal = result.postalCode || null,
      street = result.street || null,
      state = result.adminArea3 || null,
      name = (street ? street + ', ' : '') + (city ? city : county) + ', ' + state + ' ' + country;

    return {
      bounds: null,
      latLng: [result.latLng.lat, result.latLng.lng],
      name: name
    };
  },
  _formatNominatimResult: function(result) {
    var bbox = result.boundingbox;

    return {
      bounds: [
        [bbox[0], bbox[3]],
        [bbox[1], bbox[2]]
      ],
      latLng: [result.lat, result.lon],
      name: result.display_name
    };
  },
  bing: function(value, callback) {
    var me = this,
      options = {
        include: 'queryParse',
        includeNeighborhood: 1,
        key: 'Ag4-2f0g7bcmcVgKeNYvH_byJpiPQSx4F9l0aQaz9pDYMORbeBFZ0N3C3A5LSf65',
        query: value
      };

    reqwest({
      error: function() {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      jsonpCallback: 'jsonp',
      success: function(response) {
        var obj = {};

        if (response) {
          var results = [];

          for (var i = 0; i < response.resourceSets[0].resources.length; i++) {
            results.push(me._formatBingResult(response.resourceSets[0].resources[i]));
          }

          obj.results = results;
          obj.success = true;
        } else {
          obj.message = 'The response from the Bing service was invalid. Please try again.';
          obj.success = false;
        }

        callback(obj);
      },
      type: 'jsonp',
      url: util.buildUrl('https://dev.virtualearth.net/REST/v1/Locations', options)
    });
  },
  esri: function(value, callback, options) {
    var me = this,
      defaults = {
        //bbox: options && options.bbox ? options.bbox : null,
        //center: me._map.getCenter(),
        //distance: Math.min(Math.max(center.distanceTo(ne), 2000), 50000),
        f: 'json',
        //location: options && options.center ? options.center.lat + ',' + options.center.lng : null,
        //maxLocations: 5,
        //outFields: 'Subregion, Region, PlaceName, Match_addr, Country, Addr_type, City',
        text: value
      };

    options = options ? L.extend(defaults, options) : defaults;

    reqwest({
      error: function() {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      success: function(response) {
        var obj = {};

        if (response) {
          var results = [];

          for (var i = 0; i < response.locations.length; i++) {
            results.push(me._formatEsriResult(response.locations[i]));
          }

          obj.results = results;
          obj.success = true;
        } else {
          obj.message = 'The response from the Esri service was invalid. Please try again.';
          obj.success = false;
        }

        callback(obj);
      },
      type: 'jsonp',
      url: util.buildUrl('https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find', options)
    });
  },
  mapquest: function(value, callback) {
    var me = this;

    reqwest({
      error: function() {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      success: function(response) {
        if (response) {
          if (response.results && response.results[0] && response.results[0].locations && response.results[0].locations.length) {
            var results = [];

            for (var i = 0; i < response.results[0].locations.length; i++) {
              results.push(me._formatMapquestResult(response.results[0].locations[i]));
            }

            callback({
              results: results,
              success: true
            });
          } else {
            callback({
              message: 'No locations found.',
              success: true
            });
          }
        } else {
          callback({
            message: 'The geocode failed. Please try again.',
            success: false
          });
        }
      },
      type: 'jsonp',
      url: 'https://www.mapquestapi.com/geocoding/v1/address?location=' + value + '&key=Gmjtd%7Cluubn1u1nq%2C85%3Do5-lr7x9&thumbMaps=false'
    });
  },
  nominatim: function(value, callback) {
    var me = this;

    reqwest({
      error: function() {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      jsonpCallback: 'json_callback',
      success: function(response) {
        var obj = {};

        if (response) {
          var results = [];

          for (var i = 0; i < response.length; i++) {
            results.push(me._formatNominatimResult(response[i]));
          }

          obj.results = results;
          obj.success = true;
        } else {
          obj.message = 'The response from the Nominatim service was invalid. Please try again.';
          obj.success = false;
        }

        callback(obj);
      },
      type: 'jsonp',
      url: 'https://open.mapquestapi.com/nominatim/v1/search.php?format=json&addressdetails=1&dedupe=1&q=' + value + '&key=Gmjtd%7Cluubn1u1nq%2C85%3Do5-lr7x9'
    });
  }
});
