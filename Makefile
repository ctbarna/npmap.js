UGLIFY = node_modules/.bin/uglifyjs
BROWSERIFY = node_modules/.bin/browserify

all: \
				dist/npmap.js \

node_modules/.install: package.json
				npm install && npm install leaflet && npm install leaflet-hash && touch node_modules/.install

node_modules/Leaflet/dist/leaflet-src.js: node_modules/.install
				cd node_modules/Leaflet && npm install && npm run-script prepublish

npmap%js:
				@cat $(filter %.js,$^) > $@

dist:
				mkdir -p dist

dist/npmap.uncompressed.js: node_modules/.install src/*.js dist index.js node_modules/Leaflet/dist/leaflet-src.js
				$(BROWSERIFY) --debug index.js > $@

dist/npmap.js: dist/npmap.uncompressed.js
				$(UGLIFY) dist/npmap.uncompressed.js -c -m -o dist/npmap.js

clean:
				rm -f dist/*