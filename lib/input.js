
var config = require('./config.js'),
    algo = require('./algorithms.js');
    async = require('async');
    
var updateSequence = function(userId, itemId, updateUserData, callback){
  async.parallel([
    function(cb){
      algo.updateWilsonScore(itemId, function(){
        cb(null);
      });
    },
    function(cb){
      if (typeof updateUserData == 'function') {
        callback = updateUserData;
        updateUserData = true;
      }
      if (updateUserData) {
        algo.updateUserDataFor(userId, function(){
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
};

var input = {
  liked: function(userId, itemId, updateUserData, callback){
    client.sismember([config.className, 'item', itemId, 'liked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostLiked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, 'user', userId,'liked'].join(':'), itemId, function(err){
        client.sadd([config.className, 'item', itemId, 'liked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, updateUserData, callback);
        });
      });
    });
  },
  disliked: function(userId, itemId, updateUserData, callback){
    client.sismember([config.className, 'item', itemId, 'disliked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostDisliked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, 'user', userId, 'disliked'].join(':'), itemId, function(err){
        client.sadd([config.className, 'item', itemId, 'disliked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, updateUserData, callback);
        });
      });
    });
  }
};

module.exports = input;

