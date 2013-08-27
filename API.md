# NPMap.js API Docs

## baseLayer

- Presets:
  - bing
  - esri
  - google
  - mapbox
  - nps
  - stamen

## layer

- arcgisserver
- cartodb
- geojson
- kml
- mapbox (aliased from `tilestream` to preserve backwards-compatibility)
  - Required:
    - `id` OR `tileJson`
    - `type` (Required if using `npmap-bootstrap.js`)
  - Optional:
    - `opacity` (Optional)
    - `retinaVersion` (Optional)

## module

- edit
- route

## tool

- geocode
- navigate

## Notes

- If you are using `npmap-bootstrap.js`, a `leaflet` property will be added to every baseLayer, layer, map, module, or tool config object. You can use this property to interact directly with Leaflet's classes.
- `npmap-bootstrap.js` supports adding multiple maps to a page. Just make the `NPMap.config` property an array, and you are good to go.