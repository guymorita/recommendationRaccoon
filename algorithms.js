var redis = require("redis"),
    client = redis.createClient();
var async = require('async');
var config = require('./config.js').config();

var jaccardCoefficient = function(userId1, userId2, callback){
  var similarity = 0,
  likedCount = 0,
  dislikedCount = 0,
  finalJaccard = 0;
  client.sinter([config.className,userId1,'liked'].join(":"),[config.className,userId2,'liked'].join(":"), function(err, results1){
    client.sinter([config.className,userId1,'disliked'].join(":"),[config.className,userId2,'disliked'].join(":"), function(err, results2){
      client.sinter([config.className,userId1,'liked'].join(":"),[config.className,userId2,'disliked'].join(":"), function(err, results3){
        client.sinter([config.className,userId1,'disliked'].join(":"),[config.className,userId2,'liked'].join(":"), function(err, results4){
          client.scard([config.className,userId1,'liked'].join(":"), function(err, likedCount){
            client.scard([config.className,userId1,'disliked'].join(":"), function(err, dislikedCount){
              similarity += (results1.length+results2.length-results3.length-results4.length);
              finalJaccardScore = similarity / (likedCount + dislikedCount);
              callback(finalJaccardScore);
            });
          });
        });
      });
    });
  });
};

exports.updateSimilarityFor = function(userId, callback){
  userId = String(userId);
  var similaritySet, userRatedMovieIds, movieLikedByUsers, movieDislikedByUsers, similarUserIds;
  similaritySet = [config.className,userId,'similaritySet'].join(":");
  client.sunion([config.className,userId,'liked'].join(":"),[config.className,userId,'disliked'].join(":"), function(err, userRatedMovieIds){
    if (userRatedMovieIds.length > 0){
      similarUserIds = _.map(userRatedMovieIds, function(otherUserRatedId, key){
        movieLikedByUsers = [config.className, otherUserRatedId, 'liked'].join(":");
        movieDislikedByUsers = [config.className, otherUserRatedId, 'disliked'].join(":");
        return [movieLikedByUsers, movieDislikedByUsers];
      });
    }
    similarUserIds = _.flatten(similarUserIds);
    client.sunion(similarUserIds, function(err, results){
      _.each(results, function(otherUserId, key){
        if (userId !== otherUserId){
          jaccardCoefficient(userId, otherUserId, function(result) {
            client.zadd(similaritySet, result, otherUserId, function(err){
              callback();
            });
          });
        }
      });
    });
  });
};

exports.predictFor = function(userId, movieId, callback){
  userId = String(userId);
  movieId = String(movieId);
  var finalSimilaritySum = 0.0;
  var prediction = 0.0;
  var similaritySet = [config.className, userId, 'similaritySet'].join(':');
  var likedBySet = [config.className, movieId, 'liked'].join(':');
  var dislikedBySet = [config.className, movieId, 'disliked'].join(':');
  exports.similaritySum(similaritySet, likedBySet, function(result1){
    exports.similaritySum(similaritySet, dislikedBySet, function(result2){
      finalSimilaritySum = result1 - result2;
      client.scard(likedBySet, function(err, likedByCount){
        client.scard(dislikedBySet, function(err, dislikedByCount){
          prediction = finalSimilaritySum / parseFloat(likedByCount + dislikedByCount);
          if (isFinite(prediction)){
            console.log('prediction', userId, prediction);
            callback(prediction);
          }
        });
      });
    });
  });
};

exports.similaritySum = function(simSet, compSet, cb){ // trying to get the score from the similarity set given the userId from the comp set
  var similarSum = 0.0;
  client.smembers(compSet, function(err, userIds){
    async.each(userIds,
      function(userId, callback){
        client.zscore(simSet, userId, function(err, zScore){
          similarSum += parseFloat(zScore);
          callback();
        });
      },
      function(err){
        cb(similarSum);
      }
    );
  });
};

exports.updateRecommendationsFor = function(userId){
  userId = String(userId);
  var setsToUnion = [];
  var scoreMap = [];
  var tempSet = [config.className, userId, 'tempSet'].join(":");
  var tempDiffSet = [config.className, userId, 'tempDiffSet'].join(":");
  var similaritySet = [config.className, userId, 'similaritySet'].join(":");
  var recommendedSet = [config.className, userId, 'recommendedSet'].join(":");
  client.zrevrange(similaritySet, 0, config.nearestNeighbors-1, function(err, mostSimilarUserIds){
    client.zrange(similaritySet, 0, config.nearestNeighbors-1, function(err, leastSimilarUserIds){
      _.each(mostSimilarUserIds, function(id, key){
        setsToUnion.push([config.className,id,'liked'].join(":"));
      });
      // _.each(leastSimilarUserIds, function(id, key){
      //   setsToUnion.push([config.className,id,'disliked'].join(":"));
      // });
      if (setsToUnion.length > 0){
        async.each(setsToUnion,
          function(set, callback){
            client.sunionstore(tempSet, set, function(err){
              callback();
            });
          },
          function(err){
            client.sdiff(tempSet, [config.className,userId,'liked'].join(":"), [config.className,userId,'disliked'].join(":"), function(err, movieIds){
              async.each(movieIds,
                function(movieId, callback){
                  exports.predictFor(userId, movieId, function(score){
                    scoreMap.push([score, movieId]);
                    callback();
                  });
                },
                function(err){
                  async.each(scoreMap,
                    function(scorePair, callback){
                      client.zadd(recommendedSet, scorePair[0], scorePair[1], function(err){
                        callback();
                      });
                    },
                    function(err){
                      client.del(tempSet, function(err){
                        client.zcard(recommendedSet, function(err, length){
                          client.zremrangebyrank(recommendedSet, 0, length-config.numOfRecsStore-1);
                        });
                      });
                    }
                  );
                }
              );
            });
          }
        );
      }
    });
  });
};

