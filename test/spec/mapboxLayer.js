/* global afterEach, beforeEach, describe, expect, it, L, sinon */

describe('L.npmap.mapboxLayer', function() {
  var server;

  afterEach(function() {
    server.restore();
  });
  beforeEach(function() {
    server = sinon.fakeServer.create();
  });

  describe('constructor', function() {

  });
});