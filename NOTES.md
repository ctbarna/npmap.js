# Notes

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