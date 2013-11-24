/*jshint expr:true*/
var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var sinon = require('sinon');

// Chai plugins
chai.use(require('sinon-chai'));

// var blanket = require("blanket")({
//     // options are passed as an argument object to the require statement
//    "pattern": "../lib/"
//  });
var config = require('../lib/config.js');
var raccoon = require('../lib/raccoon.js');
    raccoon.connect();
var redis = require("redis"),
    client = redis.createClient();

describe('basic likes and dislikes', function(){
  beforeEach(function(done){
    client.flushdb();
    raccoon.liked('chris', 'batman', function(){
      raccoon.liked('larry', 'batman', function(){
        raccoon.disliked('greg', 'batman', function(){
          done();
        });
      });
    });
  });
  describe('basic like', function(){
    it('should validate a user has been added after a rating', function(done){
      client.smembers('movie:chris:liked', function(err, results){
        assert.equal(results[0],'batman');
        done();
      });
    });
  });
  describe('basic dislike', function(){
    it('should validate a user has been added after a rating', function(done){
      client.smembers('movie:greg:disliked', function(err, results){
        assert.equal(results[0],'batman');
        done();
      });
    });
  });
});

describe('callbacks', function(){
  it('should fire the input callback after a like is added', function(done){
    raccoon.liked('hao', 'superman', function(){
      done();
    });
  });
  it('should fire the input callback after a disliked is added', function(done){
    raccoon.liked('hao', 'superman', function(){
      done();
    });
  });
});

describe('accurate recommendations', function(){
  before(function(done){
    client.flushdb();
    raccoon.liked('ChristianB', 'Typical', function(){
      raccoon.liked('ChristianB', 'Value7', function(){
        raccoon.liked('malbery', 'Typical', function(){
          raccoon.liked('malbery', 'Value1', function(){
            raccoon.liked('malbery', 'Value2', function(){
              raccoon.liked('malbery', 'Value3', function(){
                raccoon.liked('malbery', 'Value4', function(){
                  raccoon.liked('malbery', 'Value5', function(){
                    raccoon.liked('malbery', 'Value6', function(){
                      raccoon.liked('malbery', 'Value7', function(){
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  it('should not have recommendations for malbery', function(done){
    raccoon.recommendFor('malbery', 5, function(recs){
      assert.equal(recs[0], undefined);
      done();
    });
  });
});

describe('recommendations', function(){
  before(function(done){
    client.flushdb();
    raccoon.liked('chris', 'batman', function(){
      raccoon.liked('chris', 'superman', function(){
        raccoon.disliked('chris', 'chipmunks', function(){
          raccoon.liked('max', 'batman', function(){
            raccoon.disliked('max', 'chipmunks', function(){
              raccoon.liked('greg', 'batman', function(){
                raccoon.liked('greg', 'superman', function(){
                  raccoon.liked('larry', 'batman', function(){
                    raccoon.liked('larry', 'iceage', function(){
                      raccoon.disliked('tuhin', 'batman', function(){
                        raccoon.disliked('tuhin', 'superman', function(){
                          raccoon.disliked('tuhin', 'chipmunks', function(){
                            raccoon.disliked('kristina', 'batman', function(){
                              raccoon.disliked('kristina', 'superman', function(){
                                raccoon.disliked('andre', 'superman', function(){
                                  done();
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  it('should recommend a movie if a similar user liked it', function(done){
    raccoon.recommendFor('andre', 5, function(recs){
      assert.equal(recs[0], 'batman');
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
    client.flushdb();
    raccoon.liked('chris', 'batman', function(){
      raccoon.liked('chris', 'superman', function(){
        raccoon.disliked('chris', 'chipmunks', function(){
          raccoon.liked('max', 'batman', function(){
            raccoon.disliked('max', 'chipmunks', function(){
              raccoon.liked('greg', 'batman', function(){
                raccoon.liked('greg', 'superman', function(){
                  raccoon.liked('larry', 'batman', function(){
                    raccoon.liked('larry', 'iceage', function(){
                      raccoon.disliked('tuhin', 'batman', function(){
                        raccoon.disliked('tuhin', 'superman', function(){
                          raccoon.disliked('tuhin', 'chipmunks', function(){
                            var noop = function(){};
                            for (var i = 0; i < 25; i++){
                              raccoon.liked('user'+i, 'batman', noop);
                            }
                            done();
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
  it('should have batman as the bestRated even though iceage has only likes', function(done){
    raccoon.bestRated(function(bestRated){
      assert.equal(bestRated[0], 'batman');
      done();
    });
  });
  it('should have chipmunks as the worst rated', function(done){
    raccoon.worstRated(function(worstRated){
      assert.equal(worstRated[0], 'chipmunks');
      done();
    });
  });
  it('should have batman as the most liked and superman as second', function(done){
    raccoon.mostLiked(function(mostLiked){
      assert.equal(mostLiked[0], 'batman');
      assert.equal(mostLiked[1], 'superman');
      done();
    });
  });
  it('should have chipmunks as the most disliked', function(done){
    raccoon.mostDisliked(function(mostDisliked){
      // console.log('mostDisliked', mostDisliked);
      assert.equal(mostDisliked[0], 'chipmunks');
      done();
    });
  });
  it('should have an accurate list of users who liked an item', function(done){
    raccoon.likedBy('superman', function(listOfUsers){
      // console.log('listOfUsers', listOfUsers);
      assert.include(listOfUsers, 'chris');
      assert.include(listOfUsers, 'greg');
      done();
    });
  });
  it('should have an accurate number of users who liked an item', function(done){
    raccoon.likedCount('batman', function(numUsers){
      // console.log('likedCount batman', numUsers);
      assert.equal(numUsers, 29);
      done();
    });
  });
  it('should have an accurate list of users who disliked an item', function(done){
    raccoon.dislikedBy('chipmunks', function(listOfUsers){
      // console.log('chipmunk list', listOfUsers);
      expect(listOfUsers).to.include('chris');
      expect(listOfUsers).to.include('max');
      expect(listOfUsers).to.include('tuhin');
      done();
    });
  });
  it('should have an accurate number of users who disliked an item', function(done){
    raccoon.dislikedCount('superman', function(numUsers){
      // console.log('superman list', numUsers);
      assert.equal(numUsers, 1);
      done();
    });
  });
  it('should list all a users likes', function(done){
    raccoon.allLikedFor('greg', function(itemList){
      // console.log('greg liked', itemList);
      expect(itemList).to.include('batman');
      expect(itemList).to.include('superman');
      done();
    });
  });
  it('should list all a users dislikes', function(done){
    raccoon.allDislikedFor('tuhin', function(itemList){
      // console.log('tuhin disliked', itemList);
      expect(itemList).to.include('batman');
      expect(itemList).to.include('superman');
      expect(itemList).to.include('chipmunks');
      done();
    });
  });
  it('should list all a users rated items', function(done){
    raccoon.allWatchedFor('max', function(itemList){
      expect(itemList).to.include('batman');
      expect(itemList).to.include('chipmunks');
      done();
    });
  });
  it('should not have similar users before updating', function(done){
    raccoon.mostSimilarUsers('chris', function(similarUsers){
      assert.equal(similarUsers[0], undefined);
      done();
    });
  });
  it('should not have dissimilar users before updating', function(done){
    raccoon.leastSimilarUsers('chris', function(leastSimilarUsers){
      assert.equal(leastSimilarUsers[0], undefined);
      done();
    });
  });
});

describe('db connections', function(){
  it('should connect to a remove db successfully', function(done){
    client.flushdb();
    client.end();
    client.quit();
    config.localSetup = false;
    config.remoteRedisPort = 6379;
    config.remoteRedisURL = '127.0.0.1';
    config.remoteRedisAuth = 1111;
    raccoon.liked('chris', 'batman', function(){
      raccoon.allLikedFor('chris', function(itemList){
        expect(itemList).to.include('batman');
        client.flushdb();
        client.end();
        config.localSetup = true;
        done();
      });
    });
  });
});
