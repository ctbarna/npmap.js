'use strict';

module.exports = {
  mapbox: {
    idUrl: function(_, t) {
      if (_.indexOf('/') === -1) t.loadID(_);
      else t.loadURL(_);
    },
    lBounds: function(_) {
      return new L.LatLngBounds([[_[1], _[0]], [_[3], _[2]]]);
    },
    log: function(_) {
      if (console && typeof console.error === 'function') {
        console.error(_);
      }
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
  }
};