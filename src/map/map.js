/* global L */

'use strict';

var Map = L.Map.extend({
  initialize: function(config) {
    var element = typeof config.div === 'string' ? document.getElementById(config.div) : config.div;

    L.Map.prototype.initialize.call(this, element, config);

    if (this.attributionControl) {
      this.attributionControl.setPrefix('');
    }
  }
});

module.exports = function(config) {
  return new Map(config);
};