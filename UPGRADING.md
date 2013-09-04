Upgrading to NPMap.js (aka any version of NPMap >= 2.0.0) from an old version of the NPMap library (any version < 2.0.0) does not require any manual migration; NPMap.js takes care of transitioning legacy config properties to  That said, there are a number of changes you should be aware of when building maps with NPMap.js that you should start to take into consideration.



Follow these steps to upgrade from a legacy version of the NPMap library to NPMap.js. None of them are strictly necessary, as NPMap.js takes care of the transition for you, but you should start using these new  

- To maintain consistency with Leaflet, the `zoomRange` property is now broken up into two separate properties: `minZoom` and `maxZoom`. These properties are available for the `L.npmap.map` and `L.npmap.layer` classes.
- Layer handler types are now all lowercase.
- The `TileStream` layer handler has been renamed to `mapbox`.