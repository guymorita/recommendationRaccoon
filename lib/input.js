
var config = require('./config.js'),
    algo = require('./algorithms.js');
    async = require('async');

var updateSequence = function(userId, itemId, callback){
  algo.updateSimilarityFor(userId, function(){
    async.parallel([
      function(cb){
        algo.updateWilsonScore(itemId, function(){
          cb(null);
        });
      },
      function(cb){
        algo.updateRecommendationsFor(userId, function(){
          cb(null);
        });
      }
    ],
    function(err){
      if (err){console.log('error', err);}
      callback();
    });
  });
};

var input = {
  liked: function(userId, itemId, callback){
    client.sismember([config.className, itemId, 'liked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostLiked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, userId,'liked'].join(':'), itemId, function(err){
        client.sadd([config.className, itemId, 'liked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, callback);
        });
      });
    });
  },
  disliked: function(userId, itemId, callback){
    client.sismember([config.className, itemId, 'disliked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostDisliked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, userId, 'disliked'].join(':'), itemId, function(err){
        client.sadd([config.className, itemId, 'disliked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, callback);
        });
      });
    });
  }
};

module.exports = input;

