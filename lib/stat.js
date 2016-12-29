
const config = require('./config.js'),
  client = require('./client.js');

const stat = {
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
    return new Promise((resolve, reject) => {
      return client.zrevrangeAsync([config.className,'scoreBoard'].join(":"), 0, numOfRatings, 'withscores').then((results) => {
        resolve(results);
      });
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
    client.smembers([config.className,itemId,'itemliked'].join(':'), function(err, results){
      callback(results);
    });
  },
  likedCount: function(itemId, callback){
    client.scard([config.className,itemId, 'itemliked'].join(':'), function(err, results){
      callback(results);
    });
  },
  dislikedBy: function(itemId, callback){
    client.smembers([config.className,itemId,'itemdisliked'].join(':'), function(err, results){
      callback(results);
    });
  },
  dislikedCount: function(itemId, callback){
    client.scard([config.className,itemId, 'itemdisliked'].join(':'), function(err, results){
      callback(results);
    });
  },
  allLikedFor: function(userId, callback){
    client.smembers([config.className, userId, 'userliked'].join(":"), function(err, results){
      callback(results);
    });
  },
  allDislikedFor: function(userId, callback){
    client.smembers([config.className, userId, 'userdisliked'].join(":"), function(err, results){
      callback(results);
    });
  },
  allWatchedFor: function(userId, callback){
    client.sunion([config.className, userId, 'userliked'].join(":"), [config.className, userId, 'disliked'].join(":"), function(err, results){
      callback(results);
    });
  }
};

module.exports = exports = stat;
