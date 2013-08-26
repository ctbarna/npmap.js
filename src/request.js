'use strict';

var corsLite = require('corslite'),
    json3 = require('json3'),
    strict = require('./util').mapbox.strict;

module.exports = function(url, callback) {
  strict(url, 'string');
  strict(callback, 'function');
  corsLite(url, function(error, response) {
    if (!error && response) {
      if (response.responseText[0] == 'g') {
        response = json3.parse(response.responseText.substring(5, response.responseText.length - 2));
      } else {
        response = json3.parse(response.responseText);
      }
    }

    callback(error, response);
  });
};