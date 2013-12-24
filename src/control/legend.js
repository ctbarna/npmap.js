/* globals L */

var LegendControl = L.Control.extend({
  options: {},
  _html: null,
  initialize: function(options) {
    L.Util.setOptions(this, options);
    this._container = L.DomUtil.create('div', 'leaflet-control-legend');
    L.DomEvent.disableClickPropagation(this._container);
    
    if (typeof options.html === 'string') {
      this._html = options.html;
    } else if (typeof options.html === 'function') {
      this._html = options.html();
    }

    if (this._html) {
      this._container.innerHTML = this._html;
    }
  },
  onAdd: function(map) {
    if (!this._html) {
      if (map.options.overlays.length) {
        // TODO: Iterate through overlays and create legend.
      }
    }

    this._map = map;
    return this._container;
  },
  /*
  _update: function() {
    function cssString(css) {
      var returnValue = '';

      for (var item in css) {
        returnValue += item + ': ' + css[item] + ';';
      }

      return returnValue;
    }

    if (this._div) {
      this._div.innerHTML = this._html;
      this._div.setAttribute('style', cssString(this.options.style));
    }

    return this;
  },
  _addLegend: function(html, options) {
    this.options.style = {
      'background-color': 'rgba(255,255,255,.8)',
      'background-color': '#fff',
      'padding': '5px'
    };

    options = L.Util.extend(this.options, options);
    html = html || this._html;
    this._html = html;

    return this._update();
  },
  _createLegend: function(options) {
    var html = '';

    if (options.title) {
      html += '<h4>' + options.title  + '</h4>';
    }

    if (options.layers) {
      for (var layer in options.layers) {
        if (options.layers[layer].name) {
          html += '<h6>' + options.layers[layer].name + '</h6>';
        }

        if (options.layers[layer].makiIcons) {
          for (var icon in options.layers[layer].makiIcons) {
            html += '<span style="background-color: ' + options.layers[layer].makiIcons[icon]  + ';">&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + icon + '</br>';
          }
        }

        if (options.layers[layer].clustered) {
          var bottomValue = 0,
            clusterHtml = '',
            lastColor = '',
            upperValue = 0;

          clusterHtml += '<h6>Groups</h6>';

          for (var group = 0; group < options.layers[layer].clustered.length; group++) {
            if (lastColor && options.layers[layer].clustered[group].color !== lastColor) {
              if (!lastColor.match(/^#/g)) {lastColor = '#' + lastColor;}
              clusterHtml += '<span style="background-color: ' + lastColor  + '; border-radius: 8px;">&nbsp;&nbsp;&nbsp;&nbsp;</span> ' + bottomValue + ' - ' + upperValue + ' points</br>';
              bottomValue = upperValue + 1;
            }
            upperValue = options.layers[layer].clustered[group].maxNodes;
            lastColor = options.layers[layer].clustered[group].color;
          }

          if (!lastColor.match(/^#/g)) {
            lastColor = '#' + lastColor;
          }

          if (bottomValue === 0) {
            clusterHtml = '<span style="background-color: ' + lastColor  + '; border-radius: 8px;">&nbsp;&nbsp;&nbsp;&nbsp;</span> Grouped Points</br>';
          } else {
            clusterHtml += '<span style="background-color: ' + lastColor  + '; border-radius: 8px;">&nbsp;&nbsp;&nbsp;&nbsp;</span> &gt; ' + bottomValue + ' points</br>';
          }

          html += clusterHtml;
        }
      }
    }

    return html;
  }
  */
});

L.Map.mergeOptions({
  legendControl: false
});
L.Map.addInitHook(function() {
  if (this.options.legendControl) {
    var options = {};

    if (typeof this.options.legendControl === 'object') {
      options = this.options.legendControl;
    }

    this.legendControl = L.npmap.control.legend(options).addTo(this);
  }
});

module.exports = function(options) {
  return new LegendControl(options);
};
