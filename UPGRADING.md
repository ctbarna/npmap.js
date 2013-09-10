Upgrading to NPMap.js (aka any version of NPMap >= 2.0.0) from an old version of the NPMap library (any version < 2.0.0) does not require any manual migration; NPMap.js takes care of transitioning legacy config properties for you. That said, there are a number of changes you should be aware of when building new maps with NPMap.js that you take into consideration.

- To maintain consistency with Leaflet, the `zoomRange` property is now broken up into two separate properties: `minZoom` and `maxZoom`. These properties are available for the `L.npmap.map` and `L.npmap.layer` classes.
- Layer handler types are now all lowercase. (e.g. `GeoJson` is now `geojson`.)
- The `TileStream` layer handler has been renamed to `mapbox`.