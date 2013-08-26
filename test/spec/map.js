describe('L.mapbox.map', function() {
  var element,
      server;

  afterEach(function() {
    server.restore();
  });
  beforeEach(function() {
    server = sinon.fakeServer.create();
    element = document.createElement('div');
  });

  it('passes options to constructor when called without new', function() {
      var map = L.npmap.map(element, {
        zoomControl: false
      });

      expect(map.options.zoomControl).to.equal(false);
  });
});