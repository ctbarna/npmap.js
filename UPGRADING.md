# Upgrading

Upgrading to NPMap.js (aka any version of NPMap >= 2.0.0) from an old version of the NPMap library (any version < 2.0.0) does not require any migration steps; NPMap.js takes care of transitioning any legacy configuration properties for you.

That said, there are a number of changes you should be aware of when building **new** maps with NPMap.js. Adopting the new conventions will ensure you are taking advantage of all the new features available.

## Changes

The NPMap variable no longer needs a `config` property, and it can now be either an object (one map) or an array (multiple maps).

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

    var NPMap = [{
      div: 'map1'
    },{
      div: 'map2'
    }];

The `zoomRange` property is no longer an object and is now broken up into two individual properties: `minZoom` and `maxZoom`.

Legacy:

    zoomRange: {
      max: 15,
      min: 7
    }

NPMap.js:

    minZoom: 7,
    maxZoom: 15

Some more notes:

1. The `layers` config property is now named `overlays`
2. The `events` config property is now named `hooks`
3. The `InfoBox` config property is now named `popup`
4. The `type` property for `baselayers` and `layers` should now be defined in lowercase (e.g. `GeoJson` is now `geojson`)
5. The `TileStream` layer handler is now named `mapbox`
6. The `tools` config property has been deprecated. "Tools" are now called "Controls", and they can be added as individual `Boolean` or `Object` configs. Take a look at the [examples](https://github.com/nationalparkservice/npmap.js/tree/master/examples) for more information.
