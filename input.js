exports.input = function(){

  var redis = require("redis"),
      client = redis.createClient();
      client.flushdb();
  var config = require('./config.js').config();

  var userList = function(userId){
    client.sadd([config.className, 'userList'].join(':'), userId);
  };
  var itemList = function(itemId){
    client.sadd([config.className, 'itemList'].join(':'), itemId);
  };

  return {
    userList: userList,
    itemList: itemList,
    liked: function(userId, itemId, callback){
      client.sadd([config.className, userId,'liked'].join(':'), itemId, function(err){
        callback();
      });
    },
    likedBy: function(itemId, userId, callback){
      client.sadd([config.className, itemId, 'liked'].join(':'), userId, function(err){
        callback();
      });
    },
    disliked: function(userId, itemId, callback){
      client.sadd([config.className, userId, 'disliked'].join(':'), itemId, function(err){
        callback();
      });
    },
    dislikedBy: function(itemId, userId, callback){
      client.sadd([config.className, itemId, 'disliked'].join(':'), userId, function(err){
        callback();
      });
    }
  };
};