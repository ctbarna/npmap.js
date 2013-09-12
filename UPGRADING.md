Upgrading to NPMap.js (aka any version of NPMap >= 2.0.0) from an old version of the NPMap library (any version < 2.0.0) does not require any migration steps; NPMap.js takes care of transitioning any legacy configuration properties for you. That said, there are a number of changes you should be aware of when building **new** maps with NPMap.js.

1. The NPMap variable no longer needs a `config` property, and it can now be either an object (one map) or an array (multiple maps).

Legacy:

    var NPMap = {
      config: {
        div: 'map'
      }
    };

NPMap.js:

    var NPMap = {
      div: 'map'
    };

2. The `zoomRange` property is no longer an object and is now broken up into two individual properties: `minZoom` and `maxZoom`.

Legacy:

    zoomRange: {
      max: 15,
      min: 7
    }

NPMap.js:

    minZoom: 7,
    maxZoom: 15

3. Layer handler types should now be defined in lowercase. (e.g. `GeoJson` is now `geojson`.)
4. The `TileStream` layer handler has been renamed to `mapbox`.
5. The `InfoBox` config property has been renamed to `popup`.
6. The `tools` config no longer exists. What used to be called "Tools" are now called "Controls", and they are now added as individual {Boolean} or {Object} configs. Take a look at the "control" examples for more information.
7. The `layers` config property has been renamed `overlays`.