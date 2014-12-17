'use strict';

var util = require('util');
var microtime = require('microtime');

function Operation(type, params) {
  this.type = type;
  this.params = params;
}

function InsertOperation(db_command) {
  Operation.apply(this, ['insert', {
    collectionName: db_command.collectionName,
    documents: db_command.documents,
  }]);
}
util.inherits(InsertOperation, Operation);

function UpdateOperation(db_command) {
  Operation.apply(this, ['update', {
    collectionName: db_command.collectionName,
    query: db_command.spec,
    document: db_command.document,
  }]);
}
util.inherits(UpdateOperation, Operation);

function RemoveOperation(db_command) {
  Operation.apply(this, ['remove', {
    collectionName: db_command.collectionName,
    query: db_command.selector,
  }]);
}
util.inherits(RemoveOperation, Operation);

function SearchOperation(db_command) {
  Operation.apply(this, ['search', {
    collectionName: db_command.collectionName,
    query: db_command.query,
  }]);
}
util.inherits(RemoveOperation, Operation);


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
