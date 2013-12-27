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
- (Optional) `layers` (String): A comma-delimited string of the ArcGIS Server integer layer identifiers to bring into the NPMap.js layer.
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

### L.npmap.layer.bing(config: object)

### L.npmap.layer.cartodb(config: object)

### L.npmap.layer.csv(config: object)

### L.npmap.layer.geojson(config: object)

### L.npmap.layer.github(config: object)

Add a GeoJSON/TopoJSON layer from GitHub to your map with `L.npmap.layer.github()`.

*Arguments:*

The first, and only, argument is required, and must be a layer config object with the following properties:

- (Required) `data` (Object | String): The GeoJSON data you'd like to add to the map. If this is a string, NPMap.js will parse it into an object for you. Required if your GitHub details (the other three "required" properties below) aren't provided.

OR

- (Required) `path` (String): The path to your GitHub file. This **should not** include your GitHub organization/user name or the name of the repository. This is the path to the GeoJSON file in your GitHub repository: e.g. `fire/CA-STF-HV2F.geojson`.
- (Required) `repo` (String): The name of the repository that contains the data.
- (Required) `user` (String): The name of the organization or user that owns the repository.
- (Optional) `branch` (String) The name of the branch your GitHub file should be pulled in from. Defaults to `master`.

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

- (Required) `id` (String): The id ('account.id') of the MapBox map or tileset you want to add to the map. Can also be a comma-delimited string with multiple "account.id" strings if you want to take advantage of MapBox Hosting's compositing feature. Required if `tileJson` is not provided.

OR

- (Required) `tileJson` (Object): A tileJson object for the MapBox map or tileset you want to add to the map. Required if `id` is not provided.

AND

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

### L.npmap.layer.wms(config: object)

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
- (Optional) `layer` (String|Object): A layer config object that you would like to add to the map. Can either be a layer preset string or a layer config object. If this is `undefined`, NPMap.js uses the baseLayer that is currently visible on the parent map.
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

The switcher control is used and controlled internally by NPMap.js, and is created and added to your map when more than one baseLayers is present in your map configuration object.

## Icons

### L.npmap.icon.maki(config: object)

### L.npmap.icon.npmaki(config: object)

## Utils

## Concepts

### Using Popups

### Using Tooltips

### Styling Vectors

NPMap.js uses the [simplestyle specification](https://github.com/mapbox/simplestyle-spec), which currently (at v1.1.0) includes the following:

    fill
    fill-opacity
    marker-color
    marker-size
    marker-symbol
    stroke
    stroke-opacity
    stroke-width

In addition, NPMap.js supports the following addition to the specification:

  marker-library

This property defaults to "maki", and can be either "maki" or "npmaki".

Styles for vector shapes can be set in multiple ways. NPMap.js looks in the following order for styles:

1. In the properties pulled in for each feature from the data source. You can tell NPMap.js to ignore feature styles by setting the "ignoreFeatureStyles" property to true. For example, if a GeoJSON Point feature has a "marker-symbol" property, it will be used to style the marker on the map unless "ignoreFeatureStyles" is set to true in the styles object of the overlay configuration.
2. In the overlay configuration object, via a "styles" property:
   1. As an object
   2. As a function that is passed a data object for each feature and returns an object

If no styles are found in these two places, NPMap.js falls back to a set of defaults.

If you prefer not to use the simplestyle specification, you can utilize the Leaflet styles directly by adding <code>leaflet: true</code> to the <code>styles</code> object on your overlay configuration. NPMap.js will then pass the object directly to Leaflet.

**An important note**: Style properties cascade. This means that if a "marker-symbol" property is passed in via the data source (e.g. a GeoJSON feature's properties) and a "marker-color" property is passed in via the overlay config object, the geometry will be styled with both the "marker-symbol" AND "marker-color" properties unless the "ignoreFeatureStyles" property is present.

Take a look at the [Styling Vectors example](https://github.com/nationalparkservice/npmap.js/blob/master/examples/styling-vectors.html) to see an example of using the different configuration options to style vector data.

## Notes

- NPMap.js adds `L` property to every layer, map, module, or tool config object passed in via the map configuration object. You can use this property to interact programatically with the objects created by NPMap.js and Leaflet.
- NPMap.js extends Leaflet's classes and only provides the interfaces outlined above. It is meant to act as a complement to the larger [Leaflet API](http://leafletjs.com/reference.html).
- Unlike previous versions of the NPMap library, `npmap-bootstrap.js` now supports adding multiple maps to a page. Just make the `NPMap.config` property an array of map configuration objects.
