/*jshint expr:true*/
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

// var blanket = require("blanket")({
//     // options are passed as an argument object to the require statement
//    "pattern": "../lib/"
//  });

const config = require('../lib/config.js'),
  raccoon = require('../lib/raccoon.js');

describe('basic likes, dislikes, unlikes, and undislikes', function(){
  beforeEach(function(done){
    client.flushdbAsync().then(() => {
      return raccoon.liked('chris', 'batman');
    }).then(() => {
      return raccoon.liked('larry', 'batman');
    }).then(() => {
      return raccoon.disliked('greg', 'batman');
    }).then(() => {
      return raccoon.liked('mai', 'superman');
    }).then(() => {
      return raccoon.unliked('mai', 'superman');
    }).then(() => {
      return raccoon.disliked('jesse', 'superman');
    }).then(() => {
      return raccoon.undisliked('jesse', 'superman');
    }).then(() => {
      done();
    });
  });
  describe('basic like', function(){
    it('should validate a user has been added after a rating', function(done){
      client.smembersAsync('movie:user:chris:liked').then((results) => {
        assert.equal(results[0],'batman');
        done();
      });
    });
  });
  describe('basic dislike', function(){
    it('should validate a user has been added after a rating', function(done){
      client.smembersAsync('movie:user:greg:disliked').then((results) => {
        assert.equal(results[0],'batman');
        done();
      });
    });
  });
  describe('basic unlike', function(){
    it('should validate a user has been removed after an unlike', function(done){
      client.smembersAsync('movie:user:mai:liked').then((results) => {
        assert.equal(results[0],undefined);
        done();
      });
    });
  });
  describe('basic undislike', function(){
    it('should validate a user has been removed after an undislike', function(done){
      client.smembersAsync('movie:user:jesse:disliked').then((results) => {
        assert.equal(results[0],undefined);
        done();
      });
    });
  });
});

describe('callbacks', function(){
  it('should fire the input callback after a like is added', function(done){
    raccoon.liked('hao', 'superman').then(() => {
      done();
    });
  });
  it('should fire the input callback after a disliked is added', function(done){
    raccoon.liked('hao', 'superman').then(() => {
      done();
    });
  });
});

describe('accurate recommendations', function(){
  before(function(done){
    client.flushdbAsync().then(() => {
      return raccoon.liked('ChristianB', 'Typical');
    }).then(() => {
      return raccoon.liked('ChristianB', 'Value7');
    }).then(() => {
      return raccoon.liked('malbery', 'Typical');
    }).then(() => {
      return raccoon.liked('malbery', 'Value1');
    }).then(() => {
      return raccoon.liked('malbery', 'Value2');
    }).then(() => {
      return raccoon.liked('malbery', 'Value3');
    }).then(() => {
      return raccoon.liked('malbery', 'Value4');
    }).then(() => {
      return raccoon.liked('malbery', 'Value5');
    }).then(() => {
      return raccoon.liked('malbery', 'Value6');
    }).then(() => {
      return raccoon.liked('malbery', 'Value7');
    }).then(() => {
      done();
    });
  });
  it('should not have recommendations for malbery', function(done){
    raccoon.recommendFor('malbery', 5).then((recs) => {
      assert.equal(recs[0], undefined);
      done();
    });
  });
});

describe('recommendations', function(){
  before(function(done){
    client.flushdbAsync().then(() => {
      return raccoon.liked('chris', 'batman');
    }).then(() => {
      return raccoon.liked('chris', 'superman');
    }).then(() => {
      return raccoon.disliked('chris', 'chipmunks');
    }).then(() => {
      return raccoon.liked('max', 'batman');
    }).then(() => {
      return raccoon.disliked('max', 'chipmunks');
    }).then(() => {
      return raccoon.liked('greg', 'batman');
    }).then(() => {
      return raccoon.liked('greg', 'superman');
    }).then(() => {
      return raccoon.liked('larry', 'batman');
    }).then(() => {
      return raccoon.liked('larry', 'iceage');
    }).then(() => {
      return raccoon.disliked('tuhin', 'batman');
    }).then(() => {
      return raccoon.disliked('tuhin', 'superman');
    }).then(() => {
      return raccoon.disliked('tuhin', 'chipmunks');
    }).then(() => {
      return raccoon.disliked('kristina', 'batman');
    }).then(() => {
      return raccoon.disliked('kristina', 'superman');
    }).then(() => {
      return raccoon.disliked('andre', 'superman');
    }).then(() => {
      return raccoon.disliked('andre', 'chipmunks');
    }).then(() => {
      return raccoon.disliked('guy', 'superman', { updateRecs: false });
    }).then(() => {
      done();
    });
  });
  it('should recommend a movie if a similar user liked it', function(done){
    raccoon.recommendFor('andre', 5).then((recs) => {
      assert.equal(recs[0], 'batman');
      done();
    });
  });
  it('should not recommend a movie if updateRecs was false', function(done){
    raccoon.recommendFor('guy', 5).then((recs) => {
      assert.equal(recs[0], undefined);
      done();
    });
  });
  // it('should not recommend a movie that people opposite liked', function(done){
  //   raccoon.recommendFor('andre', 5, function(recs){
  //     assert.notEqualequal(recs[0], 'chipmunks');
  //     done();
  //   });
  // });
});

describe('stats1', function(){
  before(function(done){
    client.flushdbAsync().then(() => {
      return raccoon.liked('chris', 'batman');
    }).then(() => {
      return raccoon.liked('chris', 'superman');
    }).then(() => {
      return raccoon.disliked('chris', 'chipmunks');
    }).then(() => {
      return raccoon.liked('max', 'batman');
    }).then(() => {
      return raccoon.disliked('max', 'chipmunks');
    }).then(() => {
      return raccoon.liked('greg', 'batman');
    }).then(() => {
      return raccoon.liked('greg', 'superman');
    }).then(() => {
      return raccoon.liked('larry', 'batman');
    }).then(() => {
      return raccoon.liked('larry', 'iceage');
    }).then(() => {
      return raccoon.disliked('tuhin', 'batman');
    }).then(() => {
      return raccoon.disliked('tuhin', 'superman');
    }).then(() => {
      return raccoon.disliked('tuhin', 'chipmunks');
    }).then(() => {
      for (var i = 0; i < 25; i++){
        raccoon.liked('user'+i, 'batman');
      }
      done();
    });
  });
  it('should have batman as the bestRated even though iceage has only likes', function(done){
    raccoon.bestRated().then((bestRated) => {
      assert.equal(bestRated[0], 'batman');
      done();
    });
  });
  it('should have chipmunks as the worst rated', function(done){
    raccoon.worstRated().then((worstRated) => {
      assert.equal(worstRated[0], 'chipmunks');
      done();
    });
  });
  it('should have batman as the most liked and superman as second', function(done){
    raccoon.mostLiked().then((mostLiked) => {
      assert.equal(mostLiked[0], 'batman');
      assert.equal(mostLiked[1], 'superman');
      done();
    });
  });
  it('should have chipmunks as the most disliked', function(done){
    raccoon.mostDisliked().then((mostDisliked) => {
      assert.equal(mostDisliked[0], 'chipmunks');
      done();
    });
  });
  it('should have an accurate list of users who liked an item', function(done){
    raccoon.likedBy('superman').then((listOfUsers) => {
      assert.include(listOfUsers, 'chris');
      assert.include(listOfUsers, 'greg');
      done();
    });
  });
  it('should have an accurate number of users who liked an item', function(done){
    raccoon.likedCount('batman').then((numUsers) => {
      assert.equal(numUsers, 29);
      done();
    });
  });
  it('should have an accurate list of users who disliked an item', function(done){
    raccoon.dislikedBy('chipmunks').then((listOfUsers) => {
      expect(listOfUsers).to.include('chris');
      expect(listOfUsers).to.include('max');
      expect(listOfUsers).to.include('tuhin');
      done();
    });
  });
  it('should have an accurate number of users who disliked an item', function(done){
    raccoon.dislikedCount('superman').then((numUsers) => {
      assert.equal(numUsers, 1);
      done();
    });
  });
  it('should list all a users likes', function(done){
    raccoon.allLikedFor('greg').then((itemList) => {
      expect(itemList).to.include('batman');
      expect(itemList).to.include('superman');
      done();
    });
  });
  it('should list all a users dislikes', function(done){
    raccoon.allDislikedFor('tuhin').then((itemList) => {
      expect(itemList).to.include('batman');
      expect(itemList).to.include('superman');
      expect(itemList).to.include('chipmunks');
      done();
    });
  });
  it('should list all a users rated items', function(done){
    raccoon.allWatchedFor('max').then((itemList) => {
      expect(itemList).to.include('batman');
      expect(itemList).to.include('chipmunks');
      done();
    });
  });
  it('should not have similar users before updating', function(done){
    raccoon.mostSimilarUsers('chris').then((similarUsers) => {
      assert.equal(similarUsers[0], undefined);
      done();
    });
  });
  it('should not have dissimilar users before updating', function(done){
    raccoon.leastSimilarUsers('chris').then((leastSimilarUsers) => {
      assert.equal(leastSimilarUsers[0], undefined);
      done();
    });
  });
});

// describe('db connections', function(){
//   it('should connect to a remove db successfully', function(done){
//     client.flushdb();
//     client.end();
//     client.quit();
//     config.localSetup = false;
//     config.remoteRedisPort = 6379;
//     config.remoteRedisURL = '127.0.0.1';
//     config.remoteRedisAuth = 1111;
//     raccoon.liked('chris', 'batman', function(){
//       raccoon.allLikedFor('chris', function(itemList){
//         expect(itemList).to.include('batman');
//         client.flushdb();
//         client.end();
//         config.localSetup = true;
//         done();
//       });
//     });
//   });
// });
