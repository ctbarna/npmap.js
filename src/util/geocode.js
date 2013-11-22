'use strict';

var reqwest = require('reqwest');

module.exports = ({
  /**
   * Performs a geocode operation.
   * @param {String} value
   * @param {Function} callback
   */
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
  /**
   *
   */
  nominatim: function(value, callback) {
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
          obj.results = response;
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
