Follow these steps to upgrade from a legacy version of the NPMap library to NPMap.js:

- To maintain consistency with Leaflet, the `zoomRange` property is now broken up into two separate properties: `minZoom` and `maxZoom`. These properties are available for the `L.npmap.map` and `L.npmap.layer` classes.
- Layer handler types are now all lowercase.
- The `TileStream` layer handler has been renamed to `mapbox`.