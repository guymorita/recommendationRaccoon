/*jshint expr:true*/

var raccoon = require('../raccoon.js').raccoon('mongodb://localhost/users');
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

describe('recommendations', function(){
  beforeEach(function(done){
    client.flushdb();
    raccoon.liked('chris', 'batman', function(){
      raccoon.liked('larry', 'batman', function(){
        raccoon.liked('chris', 'superman', function(){
          raccoon.liked('max', 'batman', function(){
            raccoon.liked('max', 'superman', function(){
              done();
            });
          });
        });
      });
    });
  });
  it('should recommend a movie if a similar user liked it', function(done){
    raccoon.recommendFor('larry', 5, function(recs){
      assert.equal(recs[0], 'superman');
      done();
    });
  });
});

// xdescribe('raccoon#liked', function(){
// });

// describe('raccoon#disliked', function(){
//   before(function(){
//     client.flushdb();
//   });

//   it('should only call the callback once', function(done) {
//     raccoon.liked('chris', 'batman', function(){
//       console.log('-----one chris level');
//         raccoon.liked('chris', 'superman', function(){
//           console.log('-------two chris levels');
//           raccoon.disliked('chris', 'chipmunks', function(){
//             console.log('-------three chris levels');
//             raccoon.liked('max', 'batman', function(){
//               console.log('--------four max levels');
//               raccoon.liked('greg', 'batman', function(){
//                 console.log('--------five greg levels');
//                 raccoon.liked('larry', 'batman', function(){
//                   console.log('--------six larry levels');
//                   raccoon.liked('larry', 'iceage', function(){
//                   console.log('--------seven larry levels');
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// });

// describe('stats1', function(){
//   before(function(done){
//     client.flushdb();
//     raccoon.liked('chris', 'batman', function(){
//       raccoon.liked('chris', 'superman', function(){
//         raccoon.disliked('chris', 'chipmunks', function(){
//           raccoon.liked('max', 'batman', function(){
//             raccoon.disliked('max', 'chipmunks', function(){
//               raccoon.liked('greg', 'batman', function(){
//                 raccoon.liked('greg', 'superman', function(){
//                   raccoon.liked('larry', 'batman', function(){
//                     raccoon.liked('larry', 'iceage', function(){
//                       raccoon.disliked('tuhin', 'batman', function(){
//                         raccoon.disliked('tuhin', 'superman', function(){
//                           raccoon.disliked('tuhin', 'chipmunks', function(){
//                             var noop = function(){};
//                             for (var i = 0; i < 25; i++){
//                               raccoon.liked('user'+i, 'batman', noop);
//                             }
//                             done();
//                           });
//                         });
//                       });
//                     });
//                   });
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
//   it('should have batman as the bestRated even though iceage has only likes', function(done){
//     raccoon.bestRated(function(bestRated){
//       assert.equal(bestRated[0], 'batman');
//       done();
//     });
//   });
//   it('should have chipmunks as the worst rated', function(done){
//     raccoon.worstRated(function(worstRated){
//       assert.equal(worstRated[0], 'chipmunks');
//       done();
//     });
//   });
//   it('should have batman as the most liked and superman as second', function(done){
//     raccoon.mostLiked(function(mostLiked){
//       assert.equal(mostLiked[0], 'batman');
//       assert.equal(mostLiked[1], 'superman');
//       done();
//     });
//   });
//   it('should have chipmunks as the most disliked', function(done){
//     raccoon.mostDisliked(function(mostDisliked){
//       console.log('mostDisliked', mostDisliked);
//       assert.equal(mostDisliked[0], 'chipmunks');
//       done();
//     });
//   });
//   it('should show most similar users accurately', function(done){
//     raccoon.mostSimilarUsers('chris', function(similarUsers){
//       console.log('similarUsers', similarUsers);
//       assert.equal(similarUsers[0], 'greg');
//       done();
//     });
//   });
//   it('should show least similar users accurately', function(done){
//     raccoon.leastSimilarUsers('chris', function(leastSimilarUsers){
//       assert.equal(leastSimilarUsers[0], 'tuhin');
//       done();
//     });
//   });
//   it('should have an accurate list of users who liked an item', function(done){
//     raccoon.likedBy('superman', function(listOfUsers){
//       console.log('listOfUsers', listOfUsers);
//       assert.include(listOfUsers, 'chris');
//       assert.include(listOfUsers, 'greg');
//       done();
//     });
//   });
//   it('should have an accurate number of users who liked an item', function(done){
//     raccoon.likedCount('batman', function(numUsers){
//       console.log('likedCount batman', numUsers);
//       assert.equal(numUsers, 29);
//       done();
//     });
//   });
//   it('should have an accurate list of users who disliked an item', function(done){
//     raccoon.dislikedBy('chipmunks', function(listOfUsers){
//       console.log('chipmunk list', listOfUsers);
//       expect(listOfUsers).to.include('chris');
//       expect(listOfUsers).to.include('max');
//       expect(listOfUsers).to.include('tuhin');
//       done();
//     });
//   });
//   it('should have an accurate number of users who disliked an item', function(done){
//     raccoon.dislikedCount('superman', function(numUsers){
//       console.log('superman list', numUsers);
//       assert.equal(numUsers, 1);
//       done();
//     });
//   });
//   it('should list all a users likes', function(done){
//     raccoon.allLikedFor('greg', function(itemList){
//       console.log('greg liked', itemList);
//       expect(itemList).to.include('batman');
//       expect(itemList).to.include('superman');
//       done();
//     });
//   });
//   it('should list all a users dislikes', function(done){
//     raccoon.allDislikedFor('tuhin', function(itemList){
//       console.log('tuhin disliked', itemList);
//       expect(itemList).to.include('batman');
//       expect(itemList).to.include('superman');
//       expect(itemList).to.include('chipmunks');
//       done();
//     });
//   });
//   it('should list all a users rated items', function(done){
//     raccoon.allWatchedFor('max', function(itemList){
//       console.log('max watched', itemList);
//       expect(itemList).to.include('batman');
//       expect(itemList).to.include('chipmunks');
//       done();
//     });
//   });
// });
