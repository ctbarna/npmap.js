/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.npmap.map', function() {
  var element,
      server;

  afterEach(function() {
    server.restore();
  });
  beforeEach(function() {
    element = document.createElement('div');
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

  });
  describe('layers', function() {

  });
  describe('modules', function() {

  });
  describe('tools', function() {

  });
});