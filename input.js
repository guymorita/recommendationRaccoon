exports.input = function(){

  var redis = require("redis"),
      client = redis.createClient();
      client.flushdb();

  return {
    liked: function(mappedKey, movieId){
      client.sadd([mappedKey,'liked'].join(':'), movieId);
    },
    likedBy: function(mappedKey, userId){
      client.sadd([mappedKey, 'liked'].join(':'), userId);
    },
    disliked: function(mappedKey, movieId){
      client.sadd([mappedKey, 'disliked'].join(':'), movieId);
    },
    dislikedBy: function(mappedKey, userId){
      client.sadd([mappedKey, 'disliked'].join(':'), userId);
    },
    userList: function(klass, userId){
      client.sadd([klass, 'userList'].join(':'), userId);
    },
    movieList: function(klass, movieId){
      client.sadd([klass, 'movieList'].join(':'), movieId);
    }

  }
}