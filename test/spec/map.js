/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.npmap.map', function() {
  var element,
    server;

  afterEach(function() {
    element = null;
    server.restore();
  });
  beforeEach(function() {
    element = document.createElement('div');
    element.id = 'map';
    server = sinon.fakeServer.create();
  });
  it('passes options to constructor when called without new', function() {
    var map = L.npmap.map({
      div: element,
      smallzoomControl: false
    });

    expect(map.options.smallzoomControl).to.equal(false);
  });
  describe('constructor', function() {
    it('creates the map when the div property is an object', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map).to.be.ok();
    });
  });
});
