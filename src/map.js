'use strict';

console.log('hello');

var Map = L.Map.extend({
  includes: [],
  options: {},
  _initialize: function() {
    console.log(this);

    if (!this._loaded) {
      this.setView(L.latLng(39, -96), 4);
    }
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