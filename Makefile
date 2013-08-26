UGLIFY = node_modules/.bin/uglifyjs
BROWSERIFY = node_modules/.bin/browserify

# the default rule when someone runs simply `make`
all: \
  dist/npmap.js \

node_modules/.install: package.json
  npm install && npm install leaflet && touch node_modules/.install

node_modules/Leaflet/dist/leaflet-src.js: node_modules/.install
  cd node_modules/Leaflet && npm install && npm run-script prepublish

npmap%js:
  @cat $(filter %.js,$^) > $@

dist:
  mkdir -p dist

# assemble an uncompressed but complete library for development
dist/npmap.uncompressed.js: node_modules/.install src/*.js dist index.js node_modules/Leaflet/dist/leaflet-src.js
  $(BROWSERIFY) --debug index.js > $@

# compress mapbox.js with [uglify-js](https://github.com/mishoo/UglifyJS),
# with name manging (m) and compression (c) enabled
dist/mapbox.js: dist/npmap.uncompressed.js
  $(UGLIFY) dist/npmap.uncompressed.js -c -m -o dist/npmap.js

clean:
  rm -f dist/*