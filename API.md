# NPMap.js API Docs

## Map

### L.npmap.map(config: object)

Create and configure a map.

*Arguments:*

The first, and only, argument is required. It must be a map config object with the following properties:

- (Required) `div` (Object or String): Either an HTML element or the id of an HTML element to render the map into.
- (Optional) `fullscreenControl` (Boolean): Defaults to `undefined`.
- (Optional) `geocoderControl` (Boolean or Object): Defaults to `undefined`.
- (Optional) `homeControl` (Boolean): Defaults to `true`.
- (Optional) `overviewControl` (Boolean or Object): Default to `undefined`.
- (Optional) `scaleControl` (Boolean): Defaults to `undefined`.
- (Optional) `smallzoomControl` (Boolean): Defaults to `true`.

You can also (optionally) provide any of the options supported by [`L.Map`](http://leafletjs.com/reference.html#map-options).

*Example:*

    var map = L.npmap.map({
      div: 'map',
      geocoderControl: true
    });

## Layers

### L.npmap.layer.arcgisserver(config: object)

Add a layer from an ArcGIS Server map service, including services hosted on ArcGIS Online, to your map with `L.npmap.layer.arcgisserver()`.

*Arguments:*

The first, and only, argument is required. It must be a layer config object with the following properties:

- (Required) `tiled` (Boolean): Should be `true` if the service is tiled and `false` if it is not.
- (Required) `url` (String): A URL string ending with "MapServer" for the ArcGIS Server service.
- (Optional) `attribution` (String): An attribution string for the layer. HTML is allowed.
- (Optional) `description` (String): Descriptive text for the layer. Used in legends, modules, and controls.
- (Optional) `dynamicAttribution` (String): The URL of a [dynamic attribution](http://blogs.esri.com/esri/arcgis/2012/08/15/dynamic-attribution-is-here/) endpoint for the service.
- (Optional) `layers` (String): A comma-delimited string of the ArcGIS Server layers to bring into the NPMap.js layer.
- (Optional) `name` (String): A name for the layer. Used in legends, modules, and controls.
- (Optional) `opacity` (Float): An opacity value for the layer. Defaults to `1.0`.

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

*Example:*

    var layer = L.npmap.layer.arcgisserver({
      attribution: '<a href="http://www.esri.com">Esri</a>',
      opacity: 0.5,
      tiled: true,
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer'
    });

### L.npmap.layer.cartodb(config: object)

### L.npmap.layer.geojson(config: object)

### L.npmap.layer.github(config: object)

Add a GeoJSON/TopoJSON layer from GitHub to your map with `L.npmap.layer.github()`.

*Arguments:*

The first, and only, argument is required, and must be a layer config object with the following properties:

- (Depends) `data` (Object | String): The GeoJSON data you'd like to add to the map. If this is a string, NPMap.js will parse it into an object for you. Required if your GitHub details (the other three "depends" properties) aren't provided.
- (Depends) `path` (String): The path to your GitHub file. This **should not** include your GitHub organization/user name or the name of the repository. This is the path to the GeoJSON file in your GitHub repository: e.g. `fire/CA-STF-HV2F.geojson`.
- (Depends) `repo` (String): The name of the repository that contains the data.
- (Depends) `user` (String): The name of the organization or user that owns the repository.

You can also (optionally) provide any of the options supported by [`L.GeoJSON`](http://leafletjs.com/reference.html#tilelayer).

*Example:*

    var layer = L.npmap.layer.github({
      path: 'fire/CA-STF-HV2F.geojson',
      repo: 'data',
      type: 'github',
      user: 'nationalparkservice'
    });

### L.npmap.layer.kml(config: object)

### L.npmap.layer.mapbox(config: object)

Add a layer from MapBox Hosting to your map with `L.npmap.layer.mapbox()`.

*Arguments:*

The first, and only, argument is required, and must be a layer config object with the following properties:

- (Depends) `id` (String): The id ('account.id') of the MapBox map or tileset you want to add to the map. Required if `tileJson` is not provided.
- (Depends) `tileJson` (Object): A tileJson object for the MapBox map or tileset you want to add to the map. Required if `id` is not provided.
- (Optional) `format` (String): One of the following: 'jpg70', 'jpg80', 'jpg90', 'png', 'png32', 'png64', 'png128', or 'png256'. If not provided, defaults to 'png'.
- (Optional) `icon` (String)
- (Optional) `name` (String)
- (Optional) `retinaVersion` (String): The id ('account.id') of the MapBox map or tileset designed specifically for retina devices.

You can also (optionally) provide any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

*Example:*

    var layer = L.npmap.layer.mapbox({
      id: 'examples.map-20v6611k'
    });

### L.npmap.layer.tiled(config: object)

## Controls

### L.npmap.fullscreenControl(config: object)

### L.npmap.geocoderControl(config: object)

### L.npmap.homeControl(config: object)

### L.npmap.overviewControl(config: object)

Create a map control that provides context for the currently-visible area of the map. Adapted from the [Leaflet-MiniMap](https://github.com/Norkart/Leaflet-MiniMap) plugin.

*Arguments:*

The first, and only, argument is required, and must be a config object with the following properties:

- (Optional) `autoToggleDisplay` (Boolean): Should the overview hide automatically if the parent map bounds does not fit within the bounds of the overview map? Defaults to `false`.
- (Optional) `height` (Number): The height of the overview map. Defaults to 150 pixels.
- (Required) `layer` (String|Object): A layer config object that you would like to add to the map. Can either be a layer preset string or a layer config object.
- (Optional) `toggleDisplay` (Boolean): Should the overview map be togglable? Defaults to `true`.
- (Optional) `width` (Number): The width of the overview map. Defaults to 150 pixels.
- (Optional) `zoomLevelFixed` (Number): Overrides `zoomLevelOffset`, sets the map to a fixed zoom level.
- (Optional) `zoomLevelOffset` (Number): A positive or negative number that configures the overview map to a zoom level relative to the zoom level of the main map.

You can also (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

*Example:*

    var control = L.npmap.control.overview({
      layer: 'mapbox-light'
    });

### L.npmap.scaleControl(config: object)

### L.npmap.smallzoomControl(config: object)

Create a map control that contains zoom in/out buttons.

*Arguments:*

You can (optionally) provide any of the options supported by [`L.Control`](http://leafletjs.com/reference.html#control).

*Example:*

    var control = L.npmap.control.smallzoom();

### L.npmap.switcherControl(config: object)

## Notes

- If you are using `npmap-bootstrap.js`, a `L` property will be added to every layer, map, module, or tool config object. You can use this property to interact directly with the objects created by NPMap.js and Leaflet.
- NPMap.js extends Leaflet's classes and only provides the interfaces outlined above. You can use the larger [Leaflet API](http://leafletjs.com/reference.html) as well.
- Unlike previous versions of the NPMap library, `npmap-bootstrap.js` now supports adding multiple maps to a page. Just make the `NPMap.config` property an array, and you are good to go.