
var config = require('./config.js'),
    algo = require('./algorithms.js');
    async = require('async');
    
var updateSequence = function(userId, itemId, update, callback){
  //make the update parameter optional while still allowing the callback to be last (for readability)
  if (typeof update == 'function') {
    callback = update;
    update = true;
  }
  if (update) {
    async.parallel([
      function(cb){
        algo.updateItem(itemId, function(){
          cb(null);
        });
      },
      function(cb){
        algo.updateUser(userId, function(){
          cb(null);
        });
      }
    ],
    function(err){
      if (err){console.log('error', err);}
      callback();
    });
  } else {
    callback();
  }
};

var input = {
  liked: function(userId, itemId, update, callback){
    client.sismember([config.className, 'item', itemId, 'liked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostLiked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, 'user', userId,'liked'].join(':'), itemId, function(err){
        client.sadd([config.className, 'item', itemId, 'liked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, update, callback);
        });
      });
    });
  },
  disliked: function(userId, itemId, update, callback){
    client.sismember([config.className, 'item', itemId, 'disliked'].join(":"), userId, function(err, results){
      if (results === 0){
        client.zincrby([config.className, 'mostDisliked'].join(":"), 1, itemId);
      }
      client.sadd([config.className, 'user', userId, 'disliked'].join(':'), itemId, function(err){
        client.sadd([config.className, 'item', itemId, 'disliked'].join(':'), userId, function(err){
          updateSequence(userId, itemId, update, callback);
        });
      });
    });
  }
};

module.exports = input;

