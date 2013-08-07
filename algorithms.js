// var redis = require("redis"),
    var async = require('async'),
    config = require('./config.js').config(),
    _ = require('underscore');

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

exports.updateSimilarityFor = function(userId, cb){
  userId = String(userId);
  var similaritySet, userRatedItemIds, itemLikedByUsers, itemDislikedByUsers, similarUserIds;
  similaritySet = [config.className,userId,'similaritySet'].join(":");
  client.sunion([config.className,userId,'liked'].join(":"),[config.className,userId,'disliked'].join(":"), function(err, userRatedItemIds){
    if (userRatedItemIds.length > 0){
      similarUserIds = _.map(userRatedItemIds, function(otherUserRatedId, key){
        itemLikedByUsers = [config.className, otherUserRatedId, 'liked'].join(":");
        itemDislikedByUsers = [config.className, otherUserRatedId, 'disliked'].join(":");
        return [itemLikedByUsers, itemDislikedByUsers];
      });
    }
    similarUserIds = _.flatten(similarUserIds);
    client.sunion(similarUserIds, function(err, results){
      async.each(results,
        function(otherUserId, callback){
          if (results.length === 1 || userId === otherUserId){
            callback();
          }
          if (userId !== otherUserId){
            jaccardCoefficient(userId, otherUserId, function(result) {
              client.zadd(similaritySet, result, otherUserId, function(err){
                callback();
              });
            });
          }
        },
        function(err){
          cb();
        }
      );
    });
  });
};

exports.predictFor = function(userId, itemId, callback){
  userId = String(userId);
  itemId = String(itemId);
  var finalSimilaritySum = 0.0;
  var prediction = 0.0;
  var similaritySet = [config.className, userId, 'similaritySet'].join(':');
  var likedBySet = [config.className, itemId, 'liked'].join(':');
  var dislikedBySet = [config.className, itemId, 'disliked'].join(':');
  exports.similaritySum(similaritySet, likedBySet, function(result1){
    exports.similaritySum(similaritySet, dislikedBySet, function(result2){
      finalSimilaritySum = result1 - result2;
      client.scard(likedBySet, function(err, likedByCount){
        client.scard(dislikedBySet, function(err, dislikedByCount){
          prediction = finalSimilaritySum / parseFloat(likedByCount + dislikedByCount);
          if (isFinite(prediction)){
            callback(prediction);
          } else {
            callback(0.0);
          }
        });
      });
    });
  });
};

exports.similaritySum = function(simSet, compSet, cb){
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

exports.updateRecommendationsFor = function(userId, cb){
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
      if (config.factorLeastSimilarLeastLiked){
        _.each(leastSimilarUserIds, function(id, key){
          setsToUnion.push([config.className,id,'disliked'].join(":"));
        });
      }
      if (setsToUnion.length > 0){
        async.each(setsToUnion,
          function(set, callback){
            client.sunionstore(tempSet, set, function(err){
              callback();
            });
          },
          function(err){
            client.sdiff(tempSet, [config.className,userId,'liked'].join(":"), [config.className,userId,'disliked'].join(":"), function(err, itemIds){
              async.each(itemIds,
                function(itemId, callback){
                  exports.predictFor(userId, itemId, function(score){
                    scoreMap.push([score, itemId]);
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
                          client.zremrangebyrank(recommendedSet, 0, length-config.numOfRecsStore-1, function(err){
                            cb();
                          });
                        });
                      });
                    }
                  );
                }
              );
            });
          }
        );
      } else {
        cb();
      }
    });
  });
};

exports.updateWilsonScore = function(itemId, callback){
  var scoreBoard = [config.className, 'scoreBoard'].join(":");
  var likedBySet = [config.className, itemId, 'liked'].join(':');
  var dislikedBySet = [config.className, itemId, 'disliked'].join(':');
  var z = 1.96;
  var n, phat, score;
  client.scard(likedBySet, function(err, likedResults){
    client.scard(dislikedBySet, function(err, dislikedResults){
      if ((likedResults + dislikedResults) > 0){
        n = likedResults + dislikedResults;
        phat = likedResults / parseFloat(n);
        try {
          score = (phat + z*z/(2*n) - z*Math.sqrt((phat*(1-phat)+z*z/(4*n))/n))/(1+z*z/n);
        } catch (e) {
          console.log(e.name + ": " + e.message);
          score = 0.0;
        }
        client.zadd(scoreBoard, score, itemId, function(err){
          callback();
        });
      }
    });
  });
};

