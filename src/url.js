'use strict';

module.exports = {
  mapbox: {
    base: function(hash) {
      var me = this,
          urls = (function() {
            var endpoints = [
                  'http://a.tiles.mapbox.com/v3/',
                  'http://b.tiles.mapbox.com/v3/',
                  'http://c.tiles.mapbox.com/v3/',
                  'http://d.tiles.mapbox.com/v3/'
                ],
                i = 0;

            if (me.isSsl()) {
              for (i; i < endpoints.length; i++) {
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
};