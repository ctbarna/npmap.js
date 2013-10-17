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
      if (promises[url][promiseIndex][response.cacheStatus]) {
        promises[url][promiseIndex][response.cacheStatus](response);
        if (promises[url][promiseIndex].complete) {
          promises[url][promiseIndex].complete(response);
        }
      }
    }
    delete promises[url];
  },
  checkTimeout = function (url) {
    // Checks how long we're been waiting for a response, and if it's too long, we give up
    if (cache[url].cacheStatus === 'waiting' && (new Date() - cache[url].startTime) > timeout) {
      cache[url].cacheStatus = 'error';
      cache[url].statusText = 'Request Timeout';
      cache[url].status = -408;
      fulfillPromises(url);
    }
  },
  cachedReqwest = function(options) {
    // Acts similar to 'reqwest' but caches the data
    var newOptions = options;

    // Store the callbacks as promises
    promises[options.url] = promises[options.url] ? promises[options.url] : [];
    promises[options.url].push({'success': options.success, 'error': options.error, 'complete': options.complete});

    if (cache[options.url]) {
      // We already called it once
      if (cache[options.url].status === 'waiting') {
        checkTimeout(options.url);
      } else {
        // We had a response, so we can return it
        fulfillPromises(options.url);
      }
    } else {
      cache[options.url] = {'cacheStatus': 'waiting', 'response': null, 'startTime': new Date()};

      // remove the old callbacks
      delete newOptions.success;
      delete newOptions.error;
      delete newOptions.complete;

      // Create a new one to encapsulate them all!
      newOptions.complete = function(response) {
        if (options.type === 'jsonp') {
          cache[options.url].cacheStatus = response ? 'success' : 'error';
          cache[options.url].response = response;
          cache[options.url].statusText = "OK";
          cache[options.url].status = 200;
        } else if (options.type === 'json'){
          cache[options.url].cacheStatus = response.status === 200 ? 'success' : 'error';
          cache[options.url].response = response.response;
          cache[options.url].statusText = response.statusText;
          cache[options.url].status = response.status;
        }
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

