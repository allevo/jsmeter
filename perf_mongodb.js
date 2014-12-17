'use strict';

var microtime = require('microtime');

var operation = require('./operation');
var InsertOperation = operation.InsertOperation;
var UpdateOperation = operation.UpdateOperation;
var RemoveOperation = operation.RemoveOperation;
var SearchOperation = operation.SearchOperation;


module.exports = function(mongodb, handler) {
  var _executeInsertCommand = mongodb.Db.prototype._executeInsertCommand;
  var _executeUpdateCommand = mongodb.Db.prototype._executeUpdateCommand;
  var _executeQueryCommand = mongodb.Db.prototype._executeQueryCommand;
  var _executeRemoveCommand = mongodb.Db.prototype._executeRemoveCommand;

  mongodb.Db.prototype._executeInsertCommand = function(db_command, options, callback) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      var start = microtime.nowDouble();

      arguments[arguments.length - 1] = function() {
        handler(new InsertOperation(db_command), microtime.nowDouble() - start);
        callback.apply(this, arguments);
      };
    }
    _executeInsertCommand.apply(this, arguments);
  };

  mongodb.Db.prototype._executeUpdateCommand = function(db_command, options, callback) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      var start = microtime.nowDouble();

      arguments[arguments.length - 1] = function() {
        handler(new UpdateOperation(db_command), microtime.nowDouble() - start);
        callback.apply(this, arguments);
      };
    }
    _executeUpdateCommand.apply(this, arguments);
  };

  mongodb.Db.prototype._executeRemoveCommand = function(db_command, options, callback) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      var start = microtime.nowDouble();

      arguments[arguments.length - 1] = function() {
        handler(new RemoveOperation(db_command), microtime.nowDouble() - start);
        callback.apply(this, arguments);
      };
    }
    _executeRemoveCommand.apply(this, arguments);
  };

  mongodb.Db.prototype._executeQueryCommand = function(db_command, options, callback) {
    if (typeof arguments[arguments.length - 1] === 'function') {
      var start = microtime.nowDouble();
      arguments[arguments.length - 1] = function() {
        handler(new SearchOperation(db_command), microtime.nowDouble() - start);
        callback.apply(this, arguments);
      };
    }
    _executeQueryCommand.apply(this, arguments);
  };
};
