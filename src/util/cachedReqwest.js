/* jslint node: true */
/* global window */

'use strict';
var reqwest = require('reqwest'),
  defaultTimeout = 3000;

module.exports = function (options) {
  var cachedCalls = {},
  cachedCallbacks = {},
  timeout = options && options.timeout ? options.timeout : defaultTimeout,
  callCallbacks = function (url) {
    var currCall = cachedCalls[url];
    for (var cachedCallbackIndex in cachedCallbacks[url]) {
      if (cachedCallbacks[url][cachedCallbackIndex][currCall.status]) {
        cachedCallbacks[url][cachedCallbackIndex][currCall.status](currCall.resp);
      }
    }
    delete cachedCallbacks[url];
  },
  checkTimeout = function (url) {
    if ((new Date() - cachedCalls[url].startTime) > timeout) {
      // If we have been waiting for longer than the timeout, then we should just give up
      cachedCalls[url] = {'status': 'error', 'resp': {'error': 'timeout'}};
      callCallbacks(url);
    }
  },
  cachedReqwest = function(inOptions) {
    var newOptions = inOptions;
    // Cache these callbacks

    cachedCallbacks[inOptions.url] = cachedCallbacks[inOptions.url] ? cachedCallbacks[inOptions.url] : [];
    cachedCallbacks[inOptions.url].push({'success': inOptions.success, 'error': inOptions.error});

    if (cachedCalls[inOptions.url]) {
      // We already called it once
      if (cachedCalls[inOptions.url].status === 'waiting') {
        checkTimeout(inOptions.url);
     } else {
        // We had a response, so we can return it
        delete cachedCallbacks[inOptions.url];
        inOptions[cachedCalls[inOptions.url].status](cachedCalls[inOptions.url].resp);
      }
    } else {
      cachedCalls[inOptions.url] = {'status': 'waiting', 'resp': null, 'startTime': new Date()};

      // Override these functions
      newOptions.success = function(resp) {
        cachedCalls[inOptions.url] = {'status': 'success', 'resp': resp};
        callCallbacks(inOptions.url);
      };
      newOptions.error = function(err) {
        cachedCalls[inOptions.url] = {'status': 'error', 'resp': {'error': err}};
        callCallbacks(inOptions.url);
      };

      reqwest(newOptions);
      window.setTimeout(function(){checkTimeout(inOptions.url);}, timeout);
    }
  };

  
  return {
    cachedReqwest: cachedReqwest
  };
};
/*
   reqwest({
url: tileUrl,
type: 'jsonp',
success: function (res) {
callback(res);
},
error: function (err) {
callback(err);
}
});
*/
