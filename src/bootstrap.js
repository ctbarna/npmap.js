/**
  Iterate through baseLayers, layers, modules, and tools and load all of the modules via require calls.
    
    - Dynamically load the CSS files, and load ie.css if lt IE7.
    - Do you need require.js to do this dynamically?
    - You need to support an array for NPMap.config, in case multiple maps are embedded into a single page.
    - You need to write a build script that takes the path to a NPMap.config object/array and builds a custom build of NPMap.js, loading only the modules that are needed, then minifies and combines it into a single "app.js" file. This build script should take the place of this bootstrap.js file.
 */

var NPMap = NPMap || {};

if (!NPMap.config) {
  throw new Error('The NPMap.config property is required!');
}

if (typeof NPMap.config !== 'array' && typeof NPMap.config !== 'object') {
  throw new Error('NPMap.config must be either an array or an object!');
}

(function() {
  // TODO: Show loading indicator.
})();
NPMap.bootstrap = (function() {
  return {
    buildMap: function(config) {
      if (typeof config.div !== 'string') {
        throw new Error('The div config must be a string!');
      }

      var i = 0,
          map = L.npmap.map(config.div, {});

      //console.log(map);

      for (i; i < this.options.baseLayers.length; i++) {
        var baseLayer = this.options.baseLayers[i];

        if (baseLayer.visible === true || typeof baseLayer.visible === 'undefined') {
          L.npmap.layer(baseLayer).addTo(this);
          break;
        }
      }

      for (i = 0; i < this.options.layers.length; i++) {
        var layer = this.options.baseLayers[i];

        if (layer.visible || typeof layer.visible === 'undefined') {
          L.npmap.layer[layer.type](layer).addTo(this);
        }
      }
    },
    destroyMap: function(config) {

    }
  }
})();
(function() {
  // TODO: Load CSS.
  var s = document.createElement('script');

  function callback() {
    if (typeof NPMap.config === 'array') {
      var i = 0;

      for (i; i < NPMap.config.length; i++) {
        NPMap.bootstrap.buildMap(NPMap.config[i]);
      }
    } else {
      NPMap.bootstrap.buildMap(NPMap.config);
    }
  }

  document.getElementsByTagName('head')[0].appendChild('../dist/npmap.css');
  s.src = '../dist/npmap.js';

  if (s.readyState) {
    s.onreadystatechange = function() {
      if (s.readyState === 'loaded' || s.readyState === 'complete') {
        s.onreadystatechange = null;
        callback();
      }
    };
  } else {
    s.onload = function() {
      callback();
    };
  }

  document.body.appendChild(s);
})();