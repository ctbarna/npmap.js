/* global L */

'use strict';

var base64,
    json3 = require('json3'),
    lazyLoader,
    reqwest = require('reqwest');

//
base64=(function(){return{encode:function(a){var b="",c,d,f,g,h,e,k=0;do c=a.charCodeAt(k++),d=a.charCodeAt(k++),f=a.charCodeAt(k++),g=c>>2,c=(c&3)<<4|d>>4,h=(d&15)<<2|f>>6,e=f&63,isNaN(d)?h=e=64:isNaN(f)&&(e=64),b=b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(g)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(c)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(h)+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(e);while(k<a.length);return b},decode:function(a){var b="",c,d,f,g,h,e=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");do c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),d="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),g="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),h="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(a.charAt(e++)),c=c<<2|d>>4,d=(d&15)<<4|g>>2,f=(g&3)<<6|h,b+=String.fromCharCode(c),64!=g&&(b+=String.fromCharCode(d)),64!=h&&(b+=String.fromCharCode(f));while(e<a.length);return b}}})();
// https://github.com/LukeTheDuke/Lazyloader
lazyLoader=function(i,j){function k(a){var a=a.toLowerCase(),b=a.indexOf("js"),a=a.indexOf("css");return-1==b&&-1==a?!1:b>a?"js":"css"}function m(a){var b=document.createElement("link");b.href=a;b.rel="stylesheet";b.type="text/css";b.onload=c;b.onreadystatechange=function(){("loaded"==this.readyState||"complete"==this.readyState)&&c()};document.getElementsByTagName("head")[0].appendChild(b)}function f(a){try{document.styleSheets[a].cssRules?c():document.styleSheets[a].rules&&document.styleSheets[a].rules.length?c():setTimeout(function(){f(a)},250)}catch(b){setTimeout(function(){f(a)},250)}}function c(){g--;0==g&&j&&j()}for(var g=0,d,l=document.styleSheets.length-1,h=0;h<i.length;h++)if(g++,d=i[h],"css"==k(d)&&(m(d),l++,!window.opera&&-1==navigator.userAgent.indexOf("MSIE")&&f(l)),"js"==k(d)){var e=document.createElement("script");e.type="text/javascript";e.src=d;e.onload=c;document.getElementsByTagName("head")[0].appendChild(e)}};

module.exports = {
  /**
   *
   */
  appendCssFile: function(urls, callback) {
    if (typeof urls === 'string') {
      urls = [
        urls
      ];
    }

    lazyLoader(urls, callback);
  },
  /**
   *
   */
  appendJsFile: function(urls, callback) {
    if (typeof urls === 'string') {
      urls = [
        urls
      ];
    }

    lazyLoader(urls, callback);
  },
  /**
   *
   */
  base64: base64,
  /**
   *
   */
  getChildElementsByClassName: function(parentNode, className) {
    var children = parentNode.childNodes,
        matches = [];

    function recurse(el) {
      var grandChildren = el.children;

      if (typeof el.className === 'string' && el.className.indexOf(className) !== -1) {
        var classNames = el.className.split(' ');

        for (var k = 0; k < classNames.length; k++) {
          if (classNames[k] === className) {
            matches.push(el);
            break;
          }
        }
      }

      if (grandChildren && grandChildren.length) {
        for (var j = 0; j < grandChildren.length; j++) {
          recurse(grandChildren[j]);
        }
      }
    }

    for (var i = 0; i < children.length; i++) {
      recurse(children[i]);
    }

    return matches;
  },
  /**
   *
   */
  getElementsByClassName: function(className) {
    var matches = [],
        regex = new RegExp('(^|\\s)' + className + '(\\s|$)'),
        tmp = document.getElementsByTagName('*');
    
    for (var i = 0; i < tmp.length; i++) {
      if (regex.test(tmp[i].className)) {
        matches.push(tmp[i]);
      }
    }

    return matches;
  },
  /**
   *
   */
  getEventObject: function(e) {
    if (!e) {
      e = window.event;
    }

    return e;
  },
  /**
   *
   */
  getEventObjectTarget: function(e) {
    var target;

    if (e.target) {
      target = e.target;
    } else {
      target = e.srcElement;
    }

    if (target.nodeType === 3) {
      target = target.parentNode;
    }

    return target;
  },
  /**
   * http://stackoverflow.com/a/2474742/27540
   */
  getOuterHtml: function(el) {
    if(!el || !el.tagName) {
      return '';
    }

    var div = document.createElement('div'),
        ax, txt;

    div.appendChild(el.cloneNode(false));
    txt = div.innerHTML;
    ax = txt.indexOf('>') + 1;
    txt = txt.substring(0, ax) + el.innerHTML + txt.substring(ax);
    div = null;
    return txt;
  },
  /**
   * http://stackoverflow.com/a/5675579/27540
   */
  getPropertyCount: function(obj) {
    if (!Object.keys) {
      var keys = [],
          k;

      for (k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          keys.push(k);
        }
      }

      return keys.length;
    } else {
      return Object.keys(obj).length;
    }
  },
  /**
   *
   */
  strict: function(_, type) {
    if (typeof _ !== type) {
      throw new Error('Invalid argument: ' + type + ' expected');
    }
  },
  /**
   *
   */
  strictInstance: function(_, klass, name) {
    if (!(_ instanceof klass)) {
      throw new Error('Invalid argument: ' + name + ' expected');
    }
  },
  /**
   *
   */
  strictOneOf: function(_, values) {
    if (values.indexOf(_) === -1) {
      throw new Error('Invalid argument: ' + _ + ' given, valid values are ' + values.join(', '));
    }
  }
};