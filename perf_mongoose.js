'use strict';


var microtime = require('microtime');
var ValidateOperation = require('./operation').ValidateOperation;


module.exports = function(mongoose, handler) {
  require('./perf_mongodb')(mongoose.mongo, handler);

  var Document = mongoose.Document;
  var _oldValidateDocument = Document.prototype.validate;

  Document.prototype.validate = function(callback) {
    var start = microtime.nowDouble();
    var doc = this;

    _oldValidateDocument.apply(this, [function() {
      handler(new ValidateOperation(doc), microtime.nowDouble() - start);
      callback.apply(this, arguments);
    }]);
  };
};
