/*globals L*/

//TODO: See if these functions exist elsewhere
var extend = function(obj, newObj) {
  for (var item in newObj) {
    if (Object.prototype.toString.call(newObj[item]) === '[object Object]') {
      obj[item] = extend(obj[item] || {}, newObj[item]);
    } else {
      obj[item] = newObj[item];
    }
  }
  return obj;
},
cssString = function(css) {
  var returnValue = '';
  for (var item in css) {
    returnValue += item + ': ' + css[item] + ';';
  }
  return returnValue;
},
LegendControl = L.Control.extend({
  onAdd: function () {
    this._div = L.DomUtil.create('div', 'legend');
    L.DomEvent.disableClickPropagation(this._div);
    this.update();
    return this._div;
  },
  update: function () {
    if (this._div) {
      this._div.innerHTML = this.html;
      this._div.setAttribute('style', cssString(this.options.style));
    }
    return this;
  },
  addLegend: function(html, options) {
    // Create the default style
    this.options.style = {'background-color': 'rgba(255,255,255,.6)', 'padding': '5px'};

    // Assign the input values
    options = extend(this.options, options);
    html = html || this.html;

    // Update this object
    this.html = html;
    this.options = options;

    return this.update();
  },
  createLegend: function (options) {
    var html = '';
    if (options.title) { html += '<h4>' + options.title  + '</h4>'; }
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
      }
    }
    return html;
  },
  html: '',
  options: {},
  statics: ''
});

module.exports = function(options) {
  return new LegendControl(options);
};
