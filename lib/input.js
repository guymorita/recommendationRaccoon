
var config = require('./config.js'),
    algo = require('./algorithms.js');
    async = require('async');

var updateSequence = function(userId, itemId, updateRecommendations, callback){
  algo.updateSimilarityFor(userId, function(){
    async.parallel([
      function(cb){
        algo.updateWilsonScore(itemId, function(){
          cb(null);
        });
      },
      function(cb){
		if (typeof updateRecommendations == 'function') {
			callback = updateRecommendations;
			updateRecommendations = true;
		}
        if (updateRecommendations) {
          algo.updateRecommendationsFor(userId, function(){
            cb(null);
          });
        } else {
          cb(null);
        }
      }
    ],
    function(err){
      if (err){console.log('error', err);}
      callback();
    });
  });
};

var input = {
  liked: function(userId, itemId, updateRecommendations, callback){
    client.sismember([config.className, itemId, 'liked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostLiked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, userId,'liked'].join(':'), itemId, function(err){
        client.sadd([config.className, itemId, 'liked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, updateRecommendations, callback);
        });
      });
    });
  },
  disliked: function(userId, itemId, updateRecommendations, callback){
    client.sismember([config.className, itemId, 'disliked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostDisliked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, userId, 'disliked'].join(':'), itemId, function(err){
        client.sadd([config.className, itemId, 'disliked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, updateRecommendations, callback);
        });
      });
    });
  }
};

module.exports = input;

