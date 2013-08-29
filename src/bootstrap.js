/* global L */

var NPMap = NPMap || {};

if (!NPMap.config) {
  throw new Error('The NPMap.config property is required!');
}

if (typeof NPMap.config !== 'array' && typeof NPMap.config !== 'object') {
  throw new Error('NPMap.config must be either an array or an object!');
}

(function() {
  var scripts = document.getElementsByTagName('script');

  // TODO: Show loading indicator.

  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;

    if (typeof src === 'string' && src.indexOf('bootstrap.js') !== -1) {
      NPMap.path = src.replace('bootstrap.js', '');
      break;
    }
  }
})();
NPMap.bootstrap = (function() {
  return {
    //
    presets: {},
    /**
     *
     */
    buildMap: function(config) {
      if (typeof config.div !== 'string') {
        throw new Error('The div config must be a string!');
      }

      var layers;

      if (config.layers) {
        layers = config.layers;
        delete config.layers;
      }

      config.baseLayers = (function() {
        var visible = false;

        if (L.Util.isArray(config.baseLayers) && config.baseLayers.length) {
          for (var i = 0; i < config.baseLayers.length; i++) {
            var baseLayer = config.baseLayers[i];

            /*
            if (typeof baseLayer === 'string') {
              var name = baseLayer.split('-');

              baseLayer = config.baseLayers[i] = NPMap.bootstrap.presets.baseLayers[name[0]][name[1]];
            }
            */

            baseLayer.zIndex = 0;

            if (baseLayer.visible === true || typeof baseLayer.visible === 'undefined') {
              if (visible) {
                baseLayer.visible = false;
              } else {
                baseLayer.visible = true;
                visible = true;
              }
            } else {
              baseLayer.visible = false;
            }
          }
        }

        if (visible) {
          return config.baseLayers;
        } else {
          return [{
            id: 'nps.map-lj6szvbq',
            type: 'mapbox',
            visible: true
          }];
        }
      })();
      config.center = (function() {
        var c = config.center;

        if (c) {
          return L.latLng(c.lat, c.lng);
        } else {
          return L.latLng(39, -96);
        }
      })();
      config.zoom = typeof config.zoom === 'number' ? config.zoom : 4;
      config.L = L.npmap.map(config);

      if (layers) {
        config.layers = layers;
      }

      for (var i = 0; i < config.baseLayers.length; i++) {
        var baseLayer = config.baseLayers[i];

        if (baseLayer.visible === true) {
          baseLayer.L = L.npmap.layer[baseLayer.type](baseLayer).addTo(config.L);
          break;
        }
      }

      if (L.Util.isArray(config.layers) && config.layers.length) {
        for (var j = 0; j < config.layers.length; j++) {
          var layer = config.layers[j];

          if (layer.visible || typeof layer.visible === 'undefined') {
            layer.visible = true;
            layer.L = L.npmap.layer[layer.type](layer).addTo(config.L);
          } else {
            layer.visible = false;
          }
        }
      }

      config.L.setView(config.center, config.zoom);
    }
  };
})();
(function() {
  var script = document.createElement('script');

  function callback() {
    L.npmap.util._.appendCssFile(NPMap.path + 'npmap.css');
    if (L.Browser.ie6 || L.Browser.ie7) L.npmap.util._.appendCssFile(NPMap.path + 'npmap.ie.css');
    //L.npmap.util._.request(NPMap.path + 'presets/baseLayers.json', function(error, response) {
      //NPMap.bootstrap.presets.baseLayers = response;

      if (typeof NPMap.config === 'array') {
        for (var i = 0; i < NPMap.config.length; i++) {
          NPMap.bootstrap.buildMap(NPMap.config[i]);
        }
      } else {
        NPMap.bootstrap.buildMap(NPMap.config);
      }
    //});
  }

  script.src = NPMap.path + 'npmap.js';

  if (script.readyState) {
    script.onreadystatechange = function() {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = function() {
      callback();
    };
  }

  document.body.appendChild(script);
})();