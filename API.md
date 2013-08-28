# NPMap.js API Docs

## Map

### L.npmap.map(config: object)

Create and configure a map.

*Arguments:*

The first, and only, argument is required, and must a map config object with the following properties:

- (Required) `div` (Object or String): Either an HTML element or the id of an HTML element to render the map into.

You can also (optionally) provide it with any of the options supported by [`L.Map`](http://leafletjs.com/reference.html#map-options).

*Example:*

    var map = L.npmap.map('map');

## Layers

### L.npmap.layer.arcgisserver(config: object)

Add a layer from an ArcGis Server map or feature service, including services hosted on ArcGIS Online, to your map with `L.npmap.layer.arcgisserver()`.

*Arguments:*

The first, and only, argument is required, and must be a layer config object with the following properties:

- (Required) `url` (Object): A templated URL string for the ArcGIS Server service you want to create a layer.
- (Optional) `dynamicAttribution` (String): The URL of a [dynamic attribution](http://blogs.esri.com/esri/arcgis/2012/08/15/dynamic-attribution-is-here/) endpoint for the service.
- (Optional) `icon` (String)
- (Optional) `name` (String)

You can also (optionally) provide it with any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

*Example:*

    var layer = L.npmap.layer.arcgisserver({
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}/'
    });

### L.npmap.layer.mapbox(config: object)

Add a layer from MapBox hosting, with interactivity, to your map with `L.npmap.layer.mapbox()`.

*Arguments:*

The first, and only, argument is required, and must be a layer config object with the following properties:

- (Depends) `id` (String): The id ('account.id') of the MapBox map or tileset you want to add to the map. Required if `tileJson` is not provided.
- (Depends) `tileJson` (Object): A tileJson object for the MapBox map or tileset you want to add to the map. Required if `id` is not provided.
- (Optional) `format` (String): One of the following: 'jpg70', 'jpg80', 'jpg90', 'png', 'png32', 'png64', 'png128', or 'png256'. If not provided, defaults to 'png'.
- (Optional) `icon` (String)
- (Optional) `name` (String)
- (Optional) `retinaVersion` (String): The id ('account.id') of the MapBox map or tileset designed specifically for retina devices.

You can also (optionally) provide it with any of the options supported by [`L.TileLayer`](http://leafletjs.com/reference.html#tilelayer).

*Example:*

    var layer = L.npmap.layer.mapbox({
      id: 'examples.map-20v6611k'
    });














### Layer

#### Modules

- L.TileLayer
  - arcgisserver
    - Required:
      - `type` (Only required if using `bootstrap.js`)
    - Optional:
      - `attribution`
  - cartodb
    - Required:
      - `type` (Only required if using `bootstrap.js`)
    - Optional:
      - `attribution`
  - mapbox (aliased from `tilestream` to preserve backwards-compatibility)
    - Required:
      - `id` OR `tileJson`
      - `type` (Only required if using `bootstrap.js`)
    - Optional:
      - `attribution`
      - `composited`
      - `opacity`
      - `retinaVersion`
  - tiled
  - wms
- L.GeoJSON
  - csv
  - geojson
    - Required:
      - `type` (Only required if using `bootstrap.js`)
    - Optional:
      - `attribution`
  - gpx
  - json
  - kml
    - Required:
      - `type` (Only required if using `bootstrap.js`)
    - Optional:
      - `attribution`
  - shapefile
  - xml

#### Concepts

- baseLayer vs. layer
  - `icon`
  - Presets:
    - `baseLayers.json`
- Raster
  - UTFGrid
- Vector
  - Clustering
  - Symbology
    - Defaults
    - NPS Maki

### Module

#### Modules

- edit
- itinerary
- route

#### Concepts

- Accessibility
- Usability and look-and-feel

### Tool

#### Modules

- fullscreen
- geocode
- hash
- infobox
- navigate
- overviewmap
- print
- scalebar
- share

#### Concepts

- Accessibility
- Usability and look-and-feel

### Util

## Notes

- If you are using `bootstrap.js`, a `L` property will be added to every layer, map, module, or tool config object. You can use this property to interact directly with the `NPMap.js` objects.
- `NPMap.js` extends Leaflet's classes and only provides the interfaces outlined above. You can use the larger [Leaflet API](http://leafletjs.com/reference.html) as well.
- Unlike previous versions of the NPMap library, `bootstrap.js` now supports adding multiple maps to a page. Just make the `NPMap.config` property an array, and you are good to go.