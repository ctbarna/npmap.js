describe('L.mapbox.map', function() {
  it('passes options to constructor when called without new', function() {
      var map = L.npmap.map(element, {
        zoomControl: false
      });

      expect(map.options.zoomControl).to.equal(false);
  });
});