'use strict';


var microtime = require('microtime');

module.exports = function(mongoose, handler) {
  require('./perf_mongodb')(mongoose.mongo, handler);

  /*
  var Collection = mongoose.mongo.Collection;

  function wrap(name, func) {
    return function() {
      var count = Object.keys(arguments).length;

      var callback = arguments[count - 1];
      if (typeof callback === 'function') {
        var start = microtime.nowDouble();
        arguments[count - 1] = function() {
          handler(name, microtime.nowDouble() - start);
          callback.apply(this, arguments);
        };
      }
      return func.apply(this, arguments);
    };
  }

  var _old = {
    mongoose: {
      mongodb: {
        collection: {}
      }
    }
  };

  var props = ['insert', 'update', 'remove', 'find', 'distinct', 'count', 'drop', 'findAndModify', 'findOne', 'createIndex', 'indexInformation', 'dropAllIndexes', 'mapReduce', 'group', 'options', 'indexExists', 'geoNear', 'geoHaystackSearch', 'indexes', 'aggregate', 'stats'];
  for(var i in props) {
    var prop = props[i];
    _old.mongoose.mongodb.collection[prop] = Collection.prototype[prop];
    Collection.prototype[prop] = wrap('Collection.' + prop, _old.mongoose.mongodb.collection[prop]);
  }
  */
};
