var redis = require("redis"),
    client = redis.createClient();
var async = require('async');
var config = require('./config.js').config();

// Pearson product-moment correlation coefficient

var pearsonCoefficient = function(users, person1, person2){
  var commonMovies = {};
  _.each(users[person1], function(value, key){
    if(users[person2].hasOwnProperty(key)){
      commonMovies[key]=1;
    }
  });
  var n = _.size(commonMovies);
  if (n === 0){
    return 0;
  }
  // add up all preferences
  var sum1 = _.reduce(commonMovies, function(memo, value, key){
    return memo + users[person1][key];
  }, 0);
  var sum2 = _.reduce(commonMovies, function(memo, value, key){
    return memo + users[person2][key];
  }, 0);
  // sum up all squares
  var sum1Sq = _.reduce(commonMovies, function(memo, value, key){
    return memo + Math.pow(users[person1][key],2);
  }, 0);
  var sum2Sq = _.reduce(commonMovies, function(memo, value, key){
    return memo + Math.pow(users[person2][key],2);
  }, 0);
  // sum up the products of all the matches
  var pSum = _.reduce(commonMovies, function(memo, value, key){
    return memo + (users[person1][key]*users[person2][key]);
  }, 0);
  // calculate the pearson score
  var num = pSum - (sum1*sum2/n);
  var den = Math.sqrt((sum1Sq-Math.pow(sum1,2)/n)*(sum2Sq-Math.pow(sum2,2)/n));

  if (den === 0 ){
    return 0;
  }
  var r = num/den;
  return r;
};

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
  // callback(1);
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
  // var ratedSets = [[config.className,userId,'liked'].join(":"),[config.className,userId,'disliked'].join(":")];
  var tempSet = [config.className, userId, 'tempSet'].join(":");
  var tempDiffSet = [config.className, userId, 'tempDiffSet'].join(":");
  var similaritySet = [config.className, userId, 'similaritySet'].join(":");
  var recommendedSet = [config.className, userId, 'recommendedSet'].join(":");
  client.zrevrange(similaritySet, 0, config.nearestNeighbors-1, function(err, mostSimilarUserIds){
    client.zrange(similaritySet, 0, config.nearestNeighbors-1, function(err, leastSimilarUserIds){
      _.each(mostSimilarUserIds, function(id, key){
        setsToUnion.push([config.className,id,'liked'].join(":"));
      });
      _.each(leastSimilarUserIds, function(id, key){
        setsToUnion.push([config.className,id,'disliked'].join(":"));
      });
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
                    // console.log('userid', score, movieId);
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
                          // client.zremrangebyrank(recommendedSet, 0, length-config.numOfRecsStore-1);
                        });
                      });
                    }
                  );
                }
              );
            });
          }
        );
        // });
      }
    });
  });
};



//   async.each([1,2,3,4],
//     function(score, callback){
//       finalnum += score;
//       callback();
//     },
//     function(err){console.log('finalnum', finalnum)}
//   );
//   // var mostSimilarUserIds =
// };

exports.topSimilarUsers = function(users, person1, callback, n){
  n = n || 5;
  var name, newObj;
  var scores = [];
  _.each(users, function(value, key){
    newObj = {};
    if (person1 !== key){
      newObj[key] = pearsonCoefficient(users, person1, key);
      scores.push(newObj);
    }
  });
  scores.sort(sortArrayWithNestedObjects).reverse();
  callback(scores.splice(0,n));
};

exports.getRecommendations = function(users, person1, callback){
  var totals = {};
  var simSums = {};
  var rankings = [];
  var sim, newObj;

  for (var otherPerson in users){
    if (person1 === otherPerson){
      continue;
    } else {
      sim = pearsonCoefficient(users, person1, otherPerson);
      if (sim <= 0){
        continue;
      }
      _.each(users[otherPerson], function(rating, movieTitle){
        if (!users[person1].hasOwnProperty(movieTitle) || users[person1][movieTitle] === 0){
          totals[movieTitle] = totals[movieTitle] || 0;
          totals[movieTitle] += users[otherPerson][movieTitle] * sim;
          simSums[movieTitle] = simSums[movieTitle] || 0;
          simSums[movieTitle] += sim;
        }
      });
    }
  }
  _.each(totals, function(movieTotal, movie){
    newObj = {};
    newObj[movie] = (movieTotal / simSums[movie]);
    rankings.push(newObj);
  });
  rankings.sort(sortArrayWithNestedObjects);
  rankings.reverse();
  callback(rankings);
};

function sortArrayWithNestedObjects(a,b) {
  if (a[Object.keys(a)[0]] < b[Object.keys(b)[0]])
     return -1;
  if (a[Object.keys(a)[0]] > b[Object.keys(b)[0]])
    return 1;
  return 0;
}
