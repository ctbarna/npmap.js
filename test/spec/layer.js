/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.npmap.layer', function() {
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
  describe('arcgisserver', function() {

  });
  describe('cartodb', function() {

  });
  describe('geojson', function() {

  });
  describe('github', function() {

  });
  describe('kml', function() {

  });
  describe('mapbox', function() {

  });
  describe('tiled', function() {

  });
});
