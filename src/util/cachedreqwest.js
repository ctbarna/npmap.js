/* jslint node: true */
/* global window */

'use strict';
var reqwest = require('reqwest'),
  defaultTimeout = 3000;

module.exports = function (options) {
  var cache = {},
  promises = {},
  timeout = options && options.timeout ? options.timeout : defaultTimeout,
  fulfillPromises = function (url) {
    // Loops through all the promises and fulfills them
    var response = cache[url];
    for (var promiseIndex in promises[url]) {
      if (promises[url][promiseIndex][response.status]) {
        promises[url][promiseIndex][response.status](response.resp);
      }
    }
    delete promises[url];
  },
  checkTimeout = function (url) {
    // Checks how long we're been waiting for a response, and if it's too long, we give up
    if ((new Date() - cache[url].startTime) > timeout) {
      console.log('timed out!', url);
      cache[url] = {'status': 'error', 'resp': {'error': 'timeout'}};
      fulfillPromises(url);
    }
  },
  cachedReqwest = function(options) {
    // Acts similar to 'reqwest' but caches the data
    var newOptions = options;

    // Store the callbacks as promises
    promises[options.url] = promises[options.url] ? promises[options.url] : [];
    promises[options.url].push({'success': options.success, 'error': options.error});

    if (cache[options.url]) {
      // We already called it once
      if (cache[options.url].status === 'waiting') {
        checkTimeout(options.url);
      } else {
        // We had a response, so we can return it
        fulfillPromises(options.url);
      }
    } else {
      cache[options.url] = {'status': 'waiting', 'resp': null, 'startTime': new Date()};

      // Change the response functions
      newOptions.success = function(resp) {
        cache[options.url] = {'status': 'success', 'resp': resp};
        fulfillPromises(options.url);
      };
      newOptions.error = function(err) {
        cache[options.url] = {'status': 'error', 'resp': {'error': err}};
        fulfillPromises(options.url);
      };

      reqwest(newOptions);
      window.setTimeout(function(){checkTimeout(options.url);}, timeout);
    }
  };

  return {
    cachedReqwest: cachedReqwest,
    getCache: function(url) {return cache[url];}
  };
};

