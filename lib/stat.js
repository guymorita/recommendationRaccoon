
var config = require('./config.js');

var stat = {
  recommendFor: function(userId, numberOfRecs, callback){
    client.zrevrange([config.className, userId, 'recommendedSet'].join(":"), 0, numberOfRecs, function(err, results){
      callback(results);
    });
  },
  bestRated: function(callback){
    client.zrevrange([config.className,'scoreBoard'].join(":"), 0, -1, function(err, results){
      callback(results);
    });
  },
  worstRated: function(callback){
    client.zrange([config.className, 'scoreBoard'].join(":"), 0, -1, function(err, results){
      callback(results);
    });
  },
  bestRatedWithScores: function(numOfRatings, callback){
    client.zrevrange([config.className,'scoreBoard'].join(":"), 0, numOfRatings, 'withscores', function(err, results){
      callback(results);
    });
  },
  mostLiked: function(callback){
    client.zrevrange([config.className, 'mostLiked'].join(":"), 0, -1, function(err, results){
      callback(results);
    });
  },
  mostDisliked: function(callback){
    client.zrevrange([config.className, 'mostDisliked'].join(":"), 0, -1, function(err, results){
      callback(results);
    });
  },
  usersWhoLikedAlsoLiked: function(itemId){

  },
  mostSimilarUsers: function(userId, callback){
    client.zrevrange([config.className, userId, 'similaritySet'].join(":"), 0, -1, function(err, results){
      callback(results);
    });
  },
  leastSimilarUsers: function(userId, callback){
    client.zrange([config.className, userId, 'similaritySet'].join(":"), 0, -1, function(err, results){
      callback(results);
    });
  },
  likedBy: function(itemId, callback){
    client.smembers([config.className,itemId,'liked'].join(':'), function(err, results){
      callback(results);
    });
  },
  likedCount: function(itemId, callback){
    client.scard([config.className,itemId, 'liked'].join(':'), function(err, results){
      callback(results);
    });
  },
  dislikedBy: function(itemId, callback){
    client.smembers([config.className,itemId,'disliked'].join(':'), function(err, results){
      callback(results);
    });
  },
  dislikedCount: function(itemId, callback){
    client.scard([config.className,itemId, 'disliked'].join(':'), function(err, results){
      callback(results);
    });
  },
  allLikedFor: function(userId, callback){
    client.smembers([config.className, userId, 'liked'].join(":"), function(err, results){
      callback(results);
    });
  },
  allDislikedFor: function(userId, callback){
    client.smembers([config.className, userId, 'disliked'].join(":"), function(err, results){
      callback(results);
    });
  },
  allWatchedFor: function(userId, callback){
    client.sunion([config.className, userId, 'liked'].join(":"), [config.className, userId, 'disliked'].join(":"), function(err, results){
      callback(results);
    });
  }
};

module.exports = stat;
