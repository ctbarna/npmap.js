UGLIFY = node_modules/.bin/uglifyjs
BROWSERIFY = node_modules/.bin/browserify

all: \
				dist/npmap.min.js \
				dist/npmap.css \
				dist/npmap.ie.css \
				dist/images

node_modules/.install: package.json
				npm install && npm install leaflet && npm install leaflet-hash && touch node_modules/.install

node_modules/Leaflet/dist/leaflet-src.js: node_modules/.install
				cd node_modules/Leaflet && npm install && npm run-script prepublish

npmap%js:
				@cat $(filter %.js,$^) > $@

dist:
				mkdir -p dist

dist/npmap.css: node_modules/leaflet/dist/leaflet.css \
				theme/style.css
				cat node_modules/leaflet/dist/leaflet.css \
								theme/style.css > dist/npmap.css

dist/images:
				cp -r node_modules/leaflet/dist/images dist/images

dist/npmap.ie.css: node_modules/leaflet/dist/leaflet.ie.css
				cp node_modules/leaflet/dist/leaflet.ie.css dist/npmap.ie.css

dist/npmap.js: node_modules/.install src/*.js dist index.js node_modules/Leaflet/dist/leaflet-src.js
				$(BROWSERIFY) --debug index.js > $@

dist/npmap.min.js: dist/npmap.js
				$(UGLIFY) dist/npmap.js -c -m -o dist/npmap.min.js

clean:
				rm -f dist/*