/* global L */

'use strict';

var corsLite = require('corslite'),
    json3 = require('json3');

module.exports = {
  appendCssFile: function(url, callback) {
    var css = document.createElement('link');
    css.href = url;
    css.rel = 'stylesheet';
    document.getElementsByTagName('head')[0].appendChild(css);

    // TODO: You need to validate that CSS is loaded before calling callback.
    if (callback) {
      callback();
    }
  },
  log: function(_) {
    if (console && typeof console.error === 'function') {
      console.error(_);
    }
  },
  mapbox: {
    toLeafletBounds: function(_) {
      return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
    },
    url: {
      base: function(hash) {
        var me = this,
            urls = (function() {
              var endpoints = [
                'http://a.tiles.mapbox.com/v3/',
                'http://b.tiles.mapbox.com/v3/',
                'http://c.tiles.mapbox.com/v3/',
                'http://d.tiles.mapbox.com/v3/'
              ];

              if (me.isSsl()) {
                for (var i = 0; i < endpoints.length; i++) {
                  endpoints[i] = endpoints[i].replace('http', 'https');
                }
              }

              return endpoints;
            })();

        if (hash === undefined || typeof hash !== 'number') {
          return urls[0];
        } else {
          return urls[hash % urls.length];
        }
      },
      isSsl: function() {
        return 'https:' === document.location.protocol || false;
      },
      jsonify: function(url) {
        return url.replace(/\.(geo)?jsonp(?=$|\?)/, '.$1json');
      },
      secureFlag: function(url) {
        if (!this.isSsl()) {
          return url;
        } else if (url.match(/(\?|&)secure/)) {
          return url;
        } else if (url.indexOf('?') !== -1) {
          return url + '&secure';
        } else {
          return url + '?secure';
        }
      }
    }
  },
  request: function(url, callback) {
    this.strict(url, 'string');
    this.strict(callback, 'function');
    corsLite(url, function(error, response) {
      if (!error && response) {
        if (response.responseText[0] === 'g') {
          response = json3.parse(response.responseText.substring(5, response.responseText.length - 2));
        } else {
          response = json3.parse(response.responseText);
        }
      }

      callback(error, response);
    });
  },
  strict: function(_, type) {
    if (typeof _ !== type) {
      throw new Error('Invalid argument: ' + type + ' expected');
    }
  },
  strictInstance: function(_, klass, name) {
    if (!(_ instanceof klass)) {
      throw new Error('Invalid argument: ' + name + ' expected');
    }
  },
  strictOneOf: function(_, values) {
    if (values.indexOf(_) === -1) {
      throw new Error('Invalid argument: ' + _ + ' given, valid values are ' + values.join(', '));
    }
  }
};