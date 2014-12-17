/* jshint mocha:true */
/* global xit, xdescribe */
'use strict';


var assert = require('assert');


var db;

var messages = [];
function handler() {
  messages.push(arguments);
}
function eraseMessages() {
  messages = [];
}

var mongodb = require('mongodb');
require('../index').mongodb(mongodb, handler);


function startMongodb(done) {
  mongodb.connect('mongodb://localhost/test', function(err, _db) {
    db = _db;
    done(err);
  });
}

function stopMongodb(done) {
  db.close(true, function() {
    db = null;
    done();
  });
}

function dropAllCollections(done) {
  db.dropDatabase(done);
}

function createADocument(done) {
  db.collection('documents').insert({name: 'birba'}, done);
}


describe('mongodb', function() {
  before(startMongodb);
  after(stopMongodb);

  describe('insert', function() {
    before(dropAllCollections);
    before(eraseMessages);
    before(function(done) {
      var data = [
        {name : 'birba'},
        {name : 'fuffi'},
        {name : 'pluto'},
      ];
      db.collection('documents').insert(data, done);
    });

    it('shoud have one message', function() {
      assert.equal(1, messages.length);
    });
    it('shoud be InsertOperation', function() {
      assert.equal('insert', messages[0]['0'].type);
    });
    it('should have correct collectionName', function() {
      assert.equal('test.documents', messages[0]['0'].params.collectionName);
    });

    describe('documents', function() {
      it('should be lenght 3', function() {
        assert.equal(3, messages[0]['0'].params.documents.length);
      });
      
      describe('first', function() {
        it('should have right name', function() {
          assert.equal('birba', messages[0]['0'].params.documents[0].name);
        });
        it('should have _id', function() {
          assert.ok(messages[0]['0'].params.documents[0]._id);
        });
      });
      
      describe('second', function() {
        it('should have right name', function() {
          assert.equal('fuffi', messages[0]['0'].params.documents[1].name);
        });
        it('should have _id', function() {
          assert.ok(messages[0]['0'].params.documents[1]._id);
        });
      });
      
      describe('first', function() {
        it('should have right name', function() {
          assert.equal('pluto', messages[0]['0'].params.documents[2].name);
        });
        it('should have _id', function() {
          assert.ok(messages[0]['0'].params.documents[2]._id);
        });
      });
    });
  });

  describe('save', function() {
    before(dropAllCollections);
    before(eraseMessages);
    before(function(done) {
      var data = {name : 'birba'};
      db.collection('documents').save(data, done);
    });

    it('shoud have one message', function() {
      assert.equal(1, messages.length);
    });
    it('shoud be an InsertOperation', function() {
      assert.equal('insert', messages[0]['0'].type);
    });
    it('should have correct collectionName', function() {
      assert.equal('test.documents', messages[0]['0'].params.collectionName);
    });
    describe('documents', function() {
      it('should be lenght 3', function() {
        assert.equal(1, messages[0]['0'].params.documents.length);
      });
      
      describe('first', function() {
        it('should have right name', function() {
          assert.equal('birba', messages[0]['0'].params.documents[0].name);
        });
        it('should have _id', function() {
          assert.ok(messages[0]['0'].params.documents[0]._id);
        });
      });
    });
  });

  describe('update', function() {
    before(dropAllCollections);
    before(eraseMessages);
    before(function(done) {
      this.query = {name: 'birba'};
      this.doc = {$set : { name: 'fuffi' }};
      db.collection('documents').update(this.query, this.doc, done);
    });

    it('shoud have one message', function() {
      assert.equal(1, messages.length);
    });
    it('shoud be a UpdateOperation', function() {
      assert.equal('update', messages[0]['0'].type);
    });
    it('shoud have the right collectionName', function() {
      assert.deepEqual('test.documents', messages[0]['0'].params.collectionName);
    });
    it('shoud have the right query', function() {
      assert.deepEqual(this.query, messages[0]['0'].params.query);
    });
    it('shoud have the right query', function() {
      assert.deepEqual(this.doc, messages[0]['0'].params.document);
    });
  });

  describe('remove', function() {
    before(dropAllCollections);
    before(eraseMessages);
    before(function(done) {
      this.query = { name : 'birba' };
      db.collection('documents').remove(this.query, done);
    });
    
    it('shoud have one message', function() {
      assert.equal(1, messages.length);
    });
    it('shoud be a RemoveOperation', function() {
      assert.equal('remove', messages[0]['0'].type);
    });
    it('shoud have the right collectionName', function() {
      assert.equal('test.documents', messages[0]['0'].params.collectionName);
    });
    it('shoud have the right query', function() {
      assert.deepEqual(this.query, messages[0]['0'].params.query);
    });
  });

  describe('find', function() {
    var query = { name : 'birba' };

    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').find(query, function(err, cur) {
          cur.toArray(done);
        });
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.documents', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual(query, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').find(query).toArray(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.documents', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual(query, messages[0]['0'].params.query);
      });
    });

    describe('as stream', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        var stream = db.collection('documents').find(query).stream();
        stream.on('end', done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.documents', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual(query, messages[0]['0'].params.query);
      });
    });
  });

  describe('distinct', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').distinct('name', done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({ distinct: 'documents', key: 'name', query: {} }, messages[0]['0'].params.query);
      });
    });
  });

  describe('count', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').count({name: 'birba'}, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({count: 'documents', query: {name: 'birba'}, fields: null}, messages[0]['0'].params.query);
      });
    });
  });

  describe('drop', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').drop(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({drop: 'documents'}, messages[0]['0'].params.query);
      });
    });
  });

  describe('findAndModify', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').findAndModify({name: 'birba'}, {name: 'fuffi'}, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({findandmodify: 'documents', query: {name: 'birba'}, sort: {name: 'fuffi'}, 'new': 0, remove: 0, upsert: 0}, messages[0]['0'].params.query);
      });
    });
  });

  describe('findAndRemove', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').findAndRemove({name: 'birba'}, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({findandmodify: 'documents', query: {name: 'birba'}, 'new': 0, remove: 1, upsert: 0}, messages[0]['0'].params.query);
      });
    });
  });

  describe('findOne', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').findOne({name: 'birba'}, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.documents', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({"name":"birba"}, messages[0]['0'].params.query);
      });
    });
  });

  describe('createIndex', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').createIndex('name', done);
      });
      
      it('shoud have two message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          assert.deepEqual({createIndexes:'documents', 'indexes': [{name: 'name_1', key: {name: 1}}]}, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('insert', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.indexes', messages[1]['0'].params.collectionName);
        });
        describe('documents', function() {
          it('should be one', function() {
            assert.equal(1, messages[1]['0'].params.documents.length);
          });
          it('should have right data', function() {
            assert.deepEqual({ns: 'test.documents', key: {name: 1}, name: 'name_1', unique: false}, messages[1]['0'].params.documents[0]);
          });
        });
      });
    });
  });

  describe('ensureIndex', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').ensureIndex('name', done);
      });
      
      it('shoud have four message', function() {
        assert.equal(4, messages.length);
      });

      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          assert.deepEqual({listIndexes: 'documents'}, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.indexes', messages[1]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          assert.deepEqual({ns: 'test.documents'}, messages[1]['0'].params.query);
        });
      });

      describe('third', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[2]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[2]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          assert.deepEqual({createIndexes: 'documents', indexes: [{name: 'name_1', key: {name: 1}}]}, messages[2]['0'].params.query);
        });
      });

      describe('fourth', function() {
        it('shoud be a find', function() {
          assert.equal('insert', messages[3]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.indexes', messages[3]['0'].params.collectionName);
        });
        it('shoud have the right documents', function() {
          assert.deepEqual([{ns: 'test.documents', key: {name: 1}, name: 'name_1', unique: false}], messages[3]['0'].params.documents);
        });
      });
    });
  });

  describe('indexInformation', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').indexInformation(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          assert.deepEqual({listIndexes: 'documents'}, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.indexes', messages[1]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          assert.deepEqual({ns: 'test.documents'}, messages[1]['0'].params.query);
        });
      });
    });
  });

  describe('dropAllIndexes', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').dropAllIndexes(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({deleteIndexes: 'documents', index: '*'}, messages[0]['0'].params.query);
      });
    });
  });

  describe('mapReduce', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').mapReduce(
          function(item) { return item; },
          function(acc, item) { return 0; },
          {out: {inline:1} },
          done
        );
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        assert.deepEqual({mapreduce: 'documents', map: 'function (item) { return item; }', reduce: 'function (acc, item) { return 0; }', out: {inline: 1}}, messages[0]['0'].params.query);
      });
    });
  });

  describe('group', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').group([], {}, {count: 0}, 'function(sum, doc) { return 0; }', done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        var expected = {
          group:  {
            ns: 'documents',
            '$reduce': {
              _bsontype: 'Code',
              code: 'function(sum, doc) { return 0; }',
              scope: {}
            },
            cond: {},
            initial: { count: 0 },
            out: 'inline',
            key: {}
        }};

        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('options', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').options(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {listCollections: 1, filter: {name: 'test.documents'}};
          assert.deepEqual(expected, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.namespaces', messages[1]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {name: 'test.documents'};
          assert.deepEqual(expected, messages[1]['0'].params.query);
        });
      });
    });
  });

  describe('isCapped', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').isCapped(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {listCollections: 1, filter: {name: 'test.documents'}};
          assert.deepEqual(expected, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.namespaces', messages[1]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {name: 'test.documents'};
          assert.deepEqual(expected, messages[1]['0'].params.query);
        });
      });
    });
  });

  describe('indexExists', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').indexExists('name', done);
      });
      
      it('shoud have one message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {listIndexes: 'documents'};
          assert.deepEqual(expected, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.indexes', messages[1]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {ns: 'test.documents'};
          assert.deepEqual(expected, messages[1]['0'].params.query);
        });
      });
    });
  });

  describe('geoNear', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(function(done) {
        db.collection('documents').ensureIndex({a: '2d'}, done);
      });
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').geoNear(1, 1, {query: {a: 1}, maxDistance: 11}, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        var expected = {geoNear: 'documents', near: [1,1], query: {a: 1}, maxDistance: 11};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('geoHaystackSearch', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(function(done) {
        db.collection('documents').ensureIndex({loc: 'geoHaystack', type: 1}, {bucketSize: 1}, done);
      });
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').geoHaystackSearch(1, 1, {search: {a: 1}, maxDistance: 11}, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        var expected = {geoSearch: 'documents', near: [1,1], search: {a: 1}, maxDistance: 11};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('indexes', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').indexes(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(2, messages.length);
      });
      describe('first', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[0]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {listIndexes: 'documents'};
          assert.deepEqual(expected, messages[0]['0'].params.query);
        });
      });

      describe('second', function() {
        it('shoud be a find', function() {
          assert.equal('search', messages[1]['0'].type);
        });
        it('shoud have the right collectionName', function() {
          assert.equal('test.system.indexes', messages[1]['0'].params.collectionName);
        });
        it('shoud have the right query', function() {
          var expected = {ns: 'test.documents'};
          assert.deepEqual(expected, messages[1]['0'].params.query);
        });
      });
    });
  });

  describe('aggregate', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        this.agg = [{$unwind: '$a'}];
        db.collection('documents').aggregate(this.agg, done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        var expected = {aggregate: 'documents', pipeline: this.agg};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('stats', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(createADocument);
      before(eraseMessages);
      before(function(done) {
        db.collection('documents').stats(done);
      });
      
      it('shoud have one message', function() {
        assert.equal(1, messages.length);
      });
      it('shoud be a find', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('shoud have the right collectionName', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('shoud have the right query', function() {
        var expected = {collStats: 'documents'};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });
});
