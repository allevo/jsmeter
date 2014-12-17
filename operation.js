'use strict';

var util = require('util');


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
util.inherits(SearchOperation, Operation);

function ValidateOperation(document) {
  Operation.apply(this, ['validation', {
    document: document
  }]);
}
util.inherits(ValidateOperation, Operation);


module.exports = {
  InsertOperation: InsertOperation,
  UpdateOperation: UpdateOperation,
  RemoveOperation: RemoveOperation,
  SearchOperation: SearchOperation,
  ValidateOperation: ValidateOperation,
};
