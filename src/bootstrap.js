/* global L */

var NPMap = NPMap || {};

if (!NPMap.config) {
  throw new Error('The NPMap.config property is required');
}

if (typeof NPMap.config !== 'array' && typeof NPMap.config !== 'object') {
  throw new Error('NPMap.config must be either an array or an object');
}

(function() {
  var script = document.createElement('script'),
      scripts = document.getElementsByTagName('script');

  function build(config) {
    config.L = L.npmap.map(config);
  }
  function callback() {
    var legacy = false;

    if (L.Browser.ie6 || L.Browser.ie7) {
      legacy = true;
    }

    L.npmap.util._.appendCssFile(NPMap.path + 'npmap.css', function() {
      if (!legacy) {
        cssLoaded();
      }
    });

    if (legacy) {
      L.npmap.util._.appendCssFile(NPMap.path + 'npmap.ie.css', cssLoaded);
    }
  }
  function cssLoaded() {
    if (typeof NPMap.config === 'array') {
      for (var i = 0; i < NPMap.config.length; i++) {
        build(NPMap.config[i]);
      }
    } else {
      build(NPMap.config);
    }
  }

  // TODO: Show loading indicator.

  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;

    if (typeof src === 'string' && src.indexOf('bootstrap.js') !== -1) {
      NPMap.path = src.replace('bootstrap.js', '');
      break;
    }
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