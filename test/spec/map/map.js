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
    it('sets the div property properly', function() {
      var map = L.npmap.map({
        div: element
      });

      expect(map.options.div).to.be.ok();
    });
  });
  describe('controls', function() {
    describe('fullscreenControl', function() {
      it('creates a fullscreenControl when option "fullscreenControl: true"', function() {
        var map = L.npmap.map({
          div: element,
          fullscreenControl: true
        });

        expect(map.fullscreenControl).to.be.ok();
      });
      it('does not create a fullscreenControl when option "fullscreenControl: false" or "fullscreenControl: undefined"', function() {
        var map = L.npmap.map({
          div: element
        });

        expect(map.fullscreenControl).to.be(undefined);
      });
    });
    describe('overviewControl', function() {
      it('creates an overviewControl when a valid "overviewControl" object is provided', function() {
        var map = L.npmap.map({
          div: element,
          overviewControl: {
            layer: 'mapbox-light'
          }
        });

        expect(map.overviewControl).to.be.ok();
      });
      it('does not create an overviewControl when option "overviewControl: false" or "overviewControl: undefined"', function() {
        var map = L.npmap.map({
          div: element
        });

        expect(map.overviewControl).to.be(undefined);
      });
    });
    describe('scaleControl', function() {
      it('creates a scaleControl when option "scaleControl: true"', function() {
        var map = L.npmap.map({
          div: element,
          scaleControl: true
        });

        expect(map.scaleControl).to.be.ok();
      });
      it('does not create a scaleControl when option "scaleControl: false" or "scaleControl: undefined"', function() {
        var map = L.npmap.map({
          div: element
        });

        expect(map.scaleControl).to.be(undefined);
      });
    });
    describe('smallzoomControl', function() {
      it('creates a smallzoomControl by default', function() {
        var map = L.npmap.map({
          div: element
        });

        expect(map.smallzoomControl).to.be.ok();
      });
      it('does not create a smallzoomControl when option "smallzoomControl: false"', function() {
        var map = L.npmap.map({
          div: element,
          smallzoomControl: false
        });

        expect(map.smallzoomControl).to.be(undefined);
      });
    });
  });
});