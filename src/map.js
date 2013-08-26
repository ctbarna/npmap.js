'use strict';

var Map = L.Map.extend({
  options: {

  },

  initialize: function(element, _, options) {
    L.Map.prototype.initialize.call(this, element, options);

    if (this.attributionControl) {
      this.attributionControl.setPrefix('');
    }
  }
});

module.exports = function(element, _, options) {
  return new Map(element, _, options);
};