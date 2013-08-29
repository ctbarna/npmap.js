UGLIFY = node_modules/.bin/uglifyjs
BROWSERIFY = node_modules/.bin/browserify

all: \
				dist/images \
				dist/presets \
				dist/bootstrap.js \
				dist/npmap-standalone.css \
				dist/npmap.css \
				dist/npmap.ie.css \
				dist/npmap.min.js \
				dist/npmap-standalone.min.js

node_modules/.install: package.json
				npm install && touch node_modules/.install

npmap%js:
				@cat $(filter %.js,$^) > $@

dist:
				mkdir -p dist

dist/images:
				mkdir -p dist/images
				cp -r node_modules/Leaflet/dist/images dist/images

dist/presets:
				mkdir -p dist/presets
				cp -r src/presets dist/presets

dist/bootstrap.js: src/bootstrap.js
				cp src/bootstrap.js dist/bootstrap.js

dist/npmap-standalone.css: theme/nps.css
				cp theme/nps.css dist/npmap-standalone.css

dist/npmap.css: node_modules/Leaflet/dist/leaflet.css theme/nps.css
				cat node_modules/Leaflet/dist/leaflet.css theme/nps.css > dist/npmap.css

dist/npmap.ie.css: node_modules/Leaflet/dist/leaflet.ie.css
				cp node_modules/Leaflet/dist/leaflet.ie.css dist/npmap.ie.css

dist/npmap.js: node_modules/.install dist $(shell $(BROWSERIFY) --list index.js)
				$(BROWSERIFY) --debug index.js > $@

dist/npmap.min.js: dist/npmap.js
				$(UGLIFY) $< -c -m -o $@

dist/npmap-standalone.js: node_modules/.install dist $(shell $(BROWSERIFY) --list npmap.js)
				$(BROWSERIFY) --debug npmap.js > $@

dist/npmap-standalone.min.js: dist/npmap-standalone.js
				$(UGLIFY) $< -c -m -o $@

clean:
				rm -f dist/*