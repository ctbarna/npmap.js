/* globals L */

'use strict';

var reqwest = require('reqwest'),
  util = require('../util/util');

module.exports = ({
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
  esri: function(value, callback, options) {
    var me = this,
      defaults = {
        bbox: options && options.bbox ? options.bbox : null,
        //distance: Math.min(Math.max(center.distanceTo(ne), 2000), 50000),
        f: 'json',
        location: options && options.center ? options.center.lat + ',' + options.center.lng : null,
        maxLocations: 5,
        outFields: 'Subregion, Region, PlaceName, Match_addr, Country, Addr_type, City',
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
    reqwest({
      error: function() {
        callback({
          message: 'The location search failed. Please check your network connection.',
          success: false
        });
      },
      //jsonpCallback: 'json_callback',
      success: function(response) {
        if (response) {
          console.log(response);

          if (response.results && response.results[0] && response.results[0].locations && response.results[0].locations.length > 0) {
            var result = {};

            result.results = [];
            result.search = value;
            result.success = true;

            for (var i = 0; i < response.results[0].locations; i++) {
              var details = {address: {}},
                display = null,
                location = response.results[0].locations[i],
                num = 0;

              for (var prop in location) {
                var val = location[prop];

                if (prop.indexOf('adminArea') === 0) {
                  if (prop.indexOf('Type') !== -1) {
                    details[val.toLowerCase()] = location[prop.replace('Type', '')];
                    num++;
                  }
                } else if (prop === 'postalCode') {
                  details.address.postalCode = val;
                  num++;
                } else if (prop === 'sideOfStreet') {
                  details.address.sideOfStreet = val;
                  num++;
                } else if (prop === 'street') {
                  details.address.street = val;
                  num++;
                }
              }

              if (num === 0) {
                details = null;
              }

              switch (location.geocodeQuality) {
              case 'CITY':
                display = details.city + ', ' + details.state;
                break;
              case 'POINT':
                //display =
                break;
              }

              result.results.push({
                details: details,
                display: display,
                latLng: location.latLng,
                quality: location.geocodeQuality
              });
            }

            console.log(result);
            callback(result);
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
      url: 'http://www.mapquestapi.com/geocoding/v1/address?location=' + value + '&key=Fmjtd%7Cluub2l01nd%2Cal%3Do5-96121w&thumbMaps=false'
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
      url: 'http://open.mapquestapi.com/nominatim/v1/search.php?format=json&addressdetails=1&dedupe=1&q=' + value + '&key=Fmjtd%7Cluub2l01nd%2Cal%3Do5-96121w'
    });
  }
});
