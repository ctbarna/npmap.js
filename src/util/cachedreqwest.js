/* global window */
/* jslint node: true */

'use strict';

var reqwest = require('reqwest');

module.exports = function(options) {
  var cache = {},
      defaultTimeout = 3000,
      promises = {},
      timeout = options && options.timeout ? options.timeout : defaultTimeout;

  function cachedReqwest(options) {
    var newOptions = options;

    promises[options.url] = promises[options.url] ? promises[options.url] : [];
    promises[options.url].push({'success': options.success, 'error': options.error, 'complete': options.complete});

    if (cache[options.url]) {
      if (cache[options.url].status === 'waiting') {
        checkTimeout(options.url);
      } else {
        fulfillPromises(options.url);
      }
    } else {
      cache[options.url] = {'cacheStatus': 'waiting', 'response': null, 'startTime': new Date()};

      delete newOptions.success;
      delete newOptions.error;
      delete newOptions.complete;

      newOptions.complete = function(response) {
        if (options.type === 'jsonp') {
          cache[options.url].cacheStatus = response ? 'success' : 'error';
          cache[options.url].response = response;
          cache[options.url].statusText = 'OK';
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
  }
  function checkTimeout(url) {
    if (cache[url].cacheStatus === 'waiting' && (new Date() - cache[url].startTime) > timeout) {
      cache[url].cacheStatus = 'error';
      cache[url].statusText = 'Request Timeout';
      cache[url].status = -408;
      fulfillPromises(url);
    }
  }
  function fulfillPromises(url) {
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
  }

  return {
    cachedReqwest: cachedReqwest,
    getCache: function(url) {
      return cache[url];
    }
  };
};
