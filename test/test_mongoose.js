/* jshint mocha:true */
/* global xit, xdescribe */
'use strict';


var assert = require('assert');


var messages = [];
function handler() {
  messages.push(arguments);
}
function eraseMessages() {
  messages = [];
}

var mongoose = require('mongoose');
require('../index').mongoose(mongoose, handler);


function startMongoose(done) {
  mongoose.connect('mongodb://localhost/test', done);
}

function stopMongoose(done) {
  mongoose.disconnect(done);
}
var Cat = mongoose.model('Cat', {
  name: { type: 'string', unique: true },
  geo: {type: [Number], index: '2d'},
  loc: Number
});

function dropAllCollections(done) {
  require('mongodb').connect('mongodb://localhost/test', function(err, db) {
    db.dropDatabase(done);
  });
}

function addGeoSearchIndex(done) {
  require('mongodb').connect('mongodb://localhost/test', function(err, db) {
    db.collection('cats').ensureIndex({loc: 'geoHaystack', type: 1}, {bucketSize: 1}, done);
  });
  

}

function addACat(done) {
  var test = this;
  new Cat({name: 'birba'}).save(function(err, doc) {
    test.cat = doc;
    done(err);
  });
}


describe('mongoose', function() {
  before(startMongoose);
  after(stopMongoose);

  describe('instance insert', function() {
    describe('with callback', function() {
      var cat = new Cat({name: 'birba'});
      before(dropAllCollections);
      before(Cat.ensureIndexes.bind(Cat));
      before(eraseMessages);
      before(function(done) {
        cat.save(done);
      });

      it('handler should have two message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('should be an insert', function() {
          assert.equal('validation', messages[0]['0'].type);
        });
        it('should have right document', function() {
          assert.equal('birba', messages[0]['0'].params.document.name);
        });
      });

      describe('second', function() {
        it('should be an insert', function() {
          assert.equal('insert', messages[1]['0'].type);
        });
        it('should have one document', function() {
          assert.equal(1, messages[1]['0'].params.documents.length);
        });
        it('should have one document', function() {
          assert.equal('birba', messages[1]['0'].params.documents[0].name);
        });
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(Cat.ensureIndexes.bind(Cat));
      before(eraseMessages);
      before(function(done) {
        var cat = new Cat({name: 'birba'});
        cat.save();
        setTimeout(done, 100);
      });

      it('handler should have two message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('should be an insert', function() {
          assert.equal('validation', messages[0]['0'].type);
        });
        it('should have right document', function() {
          assert.equal('birba', messages[0]['0'].params.document.name);
        });
      });

      describe('second', function() {
        it('should be an insert', function() {
          assert.equal('insert', messages[1]['0'].type);
        });
        it('should have one document', function() {
          assert.equal(1, messages[1]['0'].params.documents.length);
        });
        it('should have one document', function() {
          assert.equal('birba', messages[1]['0'].params.documents[0].name);
        });
      });
    });
  });

  describe('instance remove', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        this.cat.remove(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('remove', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({_id: this.cat._id}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        this.cat.remove();
        setTimeout(done, 100);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('remove', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({_id: this.cat._id}, messages[0]['0'].params.query);
      });
    });
  });

  xdescribe('ensureIndexes', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        Cat.ensureIndexes(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('Collection.remove', messages[0]['0']);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(eraseMessages);
      before(function(done) {
        Cat.ensureIndexes();
        setTimeout(done, 100);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('Collection.remove', messages[0]['0']);
      });
    });
  });

  describe('model remove', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.remove({name: 'birba'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('remove', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.remove({name: 'birba'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('remove', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });
  });

  describe('model find', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.find({name: 'birba'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.find({name: 'birba'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });

    describe('as stream', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        var stream = Cat.find({name: 'birba'}).stream();
        stream.on('end', done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });

    });
  });

  describe('model findById', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findById(this.cat._id, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({_id: this.cat._id}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findById(this.cat._id).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({_id: this.cat._id}, messages[0]['0'].params.query);
      });
    });
  });

  describe('model findOne', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findOne({name: 'birba'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findOne({name: 'birba'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });
  });

  describe('model count', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.count({name: 'birba'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({count:'cats', query: {name: 'birba'}, fields: null}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.count({name: 'birba'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({count:'cats', query: {name: 'birba'}, fields: null}, messages[0]['0'].params.query);
      });
    });
  });

  describe('model distinct', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.distinct('name', done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({distinct: 'cats', key: 'name', query: {}}, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.distinct('name').exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({distinct: 'cats', key: 'name', query: {}}, messages[0]['0'].params.query);
      });
    });
  });

  describe('model where', function() {
    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.where({name: 'birba'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
    });
  });

  describe('model findOneAndUpdate', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findOneAndUpdate({name: 'birba'}, {name: 'fuffi'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {name: 'birba'}, 'new': 1, remove: 0, upsert: 0, update: { '$set': {name: 'fuffi'}}};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findOneAndUpdate({name: 'birba'}, {name: 'fuffi'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {name: 'birba'}, 'new': 1, remove: 0, upsert: 0, update: { '$set': {name: 'fuffi'}}};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('model findByIdAndUpdate', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findByIdAndUpdate(this.cat._id, {name: 'fuffi'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {_id: this.cat._id}, 'new': 1, remove: 0, upsert: 0, update: { '$set': {name: 'fuffi'}}};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findByIdAndUpdate(this.cat._id, {name: 'fuffi'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {_id: this.cat._id}, 'new': 1, remove: 0, upsert: 0, update: { '$set': {name: 'fuffi'}}};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('model findOneAndRemove', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findOneAndRemove({name: 'birba'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {name: 'birba'}, 'new': 0, remove: 1, upsert: 0};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findOneAndRemove({name: 'birba'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a remove', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {name: 'birba'}, 'new': 0, remove: 1, upsert: 0};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('model findByIdAndRemove', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findByIdAndRemove(this.cat._id, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a search', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {_id: this.cat._id}, 'new': 0, remove: 1, upsert: 0};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.findByIdAndRemove(this.cat._id).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be a search', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have right query', function() {
        var expected = {findandmodify: 'cats', query: {_id: this.cat._id}, 'new': 0, remove: 1, upsert: 0};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('model create', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.create({name: 'birba'}, done);
      });


      it('handler should have two message', function() {
        assert.equal(2, messages.length);
      });

      describe('first', function() {
        it('should be an insert', function() {
          assert.equal('validation', messages[0]['0'].type);
        });
        it('should have right document', function() {
          assert.equal('birba', messages[0]['0'].params.document.name);
        });
      });

      describe('second', function() {
        it('should be on right collection', function() {
          assert.equal('test.cats', messages[1]['0'].params.collectionName);
        });
        it('should be an insert', function() {
          assert.equal('insert', messages[1]['0'].type);
        });
        it('should have one document', function() {
          assert.deepEqual(1, messages[1]['0'].params.documents.length);
        });
        it('should have the right document', function() {
          assert.deepEqual('birba', messages[1]['0'].params.documents[0].name);
        });
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.create({name: 'birba'}).then(done.bind(null, null));
      });

      it('handler should be called', function() {
        assert.equal(2, messages.length);
      });
      describe('first', function() {
        it('should be an insert', function() {
          assert.equal('validation', messages[0]['0'].type);
        });
        it('should have right document', function() {
          assert.equal('birba', messages[0]['0'].params.document.name);
        });
      });

      describe('second', function() {
        it('should be on right collection', function() {
          assert.equal('test.cats', messages[1]['0'].params.collectionName);
        });
        it('should be an insert', function() {
          assert.equal('insert', messages[1]['0'].type);
        });
        it('should have one document', function() {
          assert.deepEqual(1, messages[1]['0'].params.documents.length);
        });
        it('should have the right document', function() {
          assert.deepEqual('birba', messages[1]['0'].params.documents[0].name);
        });
      });
    });
  });

  describe('model update', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.update({name: 'birba'}, {name: 'fuffi'}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.cats', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('update', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
      it('should have the right document', function() {
        assert.deepEqual({$set: {name: 'fuffi'}}, messages[0]['0'].params.document);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.update({name: 'birba'}, {name: 'fuffi'}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.cats', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('update', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        assert.deepEqual({name: 'birba'}, messages[0]['0'].params.query);
      });
      it('should have the right document', function() {
        assert.deepEqual({$set: {name: 'fuffi'}}, messages[0]['0'].params.document);
      });
    });
  });

  describe('model mapReduce', function() {
    var o = {
      map: function () { return this.name; },
      reduce: function (k, vals) { return vals.length; },
      out: { replace: 'createdCollectionNameForResults' },
    };
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.mapReduce(o, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        var expected = {
          mapreduce: 'cats',
          map: 'function () { return this.name; }',
          reduce: 'function (k, vals) { return vals.length; }',
          out: { replace: 'createdCollectionNameForResults' },
          verbose: true
        };
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.mapReduce(o).then(done.bind(null, null));
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        var expected = {
          mapreduce: 'cats',
          map: 'function () { return this.name; }',
          reduce: 'function (k, vals) { return vals.length; }',
          out: { replace: 'createdCollectionNameForResults' },
          verbose: true
        };
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('model geoNear', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(Cat.ensureIndexes.bind(Cat));
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.geoNear([1,3], { maxDistance : 5, spherical : true }, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        var expected = {geoNear: 'cats', near: [1,3], maxDistance: 5, spherical: true};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(Cat.ensureIndexes.bind(Cat));
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.geoNear([1,3], { maxDistance : 5, spherical : true }).then(done.bind(null, null));
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        var expected = {geoNear: 'cats', near: [1,3], maxDistance: 5, spherical: true};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  describe('model aggregate', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.aggregate({ $group: { _id: null, maxBalance: { $max: '$balance' }}}, { $project: { _id: 0, maxBalance: 1 }}, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        var expected = {aggregate: 'cats', pipeline: [{$group: {_id: null, maxBalance: {$max: '$balance'}}}, {$project: {_id: 0, maxBalance: 1}}]};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.aggregate({ $group: { _id: null, maxBalance: { $max: '$balance' }}}, { $project: { _id: 0, maxBalance: 1 }}).exec(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be on right collection', function() {
        assert.equal('test.$cmd', messages[0]['0'].params.collectionName);
      });
      it('should be an insert', function() {
        assert.equal('search', messages[0]['0'].type);
      });
      it('should have the right query', function() {
        var expected = {aggregate: 'cats', pipeline: [{$group: {_id: null, maxBalance: {$max: '$balance'}}}, {$project: {_id: 0, maxBalance: 1}}]};
        assert.deepEqual(expected, messages[0]['0'].params.query);
      });
    });
  });

  xdescribe('model geoSearch', function() {
    describe('with callback', function() {
      before(dropAllCollections);
      before(Cat.ensureIndexes.bind(Cat));
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.geoSearch({}, { near: [10, 10], maxDistance: 5 }, done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a aggregate', function() {
        assert.equal('Collection.aggregate', messages[0]['0']);
      });
    });

    describe('without callback', function() {
      before(dropAllCollections);
      before(Cat.ensureIndexes.bind(Cat));
      before(addACat);
      before(eraseMessages);
      before(function(done) {
        Cat.geoSearch({}, { near: [10, 10], maxDistance: 5 }).then(done);
      });

      it('handler should be called', function() {
        assert.equal(1, messages.length);
      });
      it('should be a aggregate', function() {
        assert.equal('Collection.aggregate', messages[0]['0']);
      });
    });
  });
});