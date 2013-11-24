
var config = require('./config.js'),
    redis = require('redis'),
    algo = require('./algorithms.js'),
    input = require('./input.js'),
    stat = require('./stat.js');

function Raccoon(){
}

Raccoon.prototype.connect = function(port, url, auth){
  port = port || 6379;
  url = url || '127.0.0.1';
  auth = auth || '';

  client = redis.createClient(port, url);
  if (auth){
    client.auth(auth, function (err) {
     if (err) { throw err; }
    });
  }
};

Raccoon.prototype.flush = function(){
  client.flushdb();
};

Raccoon.prototype.config = config;
Raccoon.prototype.stat = stat;
Raccoon.prototype.liked = input.liked;
Raccoon.prototype.disliked = input.disliked;
Raccoon.prototype.recommendFor = stat.recommendFor;
Raccoon.prototype.bestRated = stat.bestRated;
Raccoon.prototype.worstRated = stat.worstRated;
Raccoon.prototype.bestRatedWithScores = stat.bestRatedWithScores;
Raccoon.prototype.mostLiked = stat.mostLiked;
Raccoon.prototype.mostDisliked = stat.mostDisliked;
Raccoon.prototype.usersWhoLikedAlsoLiked = stat.usersWhoLikedAlsoLiked;
Raccoon.prototype.mostSimilarUsers = stat.mostSimilarUsers;
Raccoon.prototype.leastSimilarUsers = stat.leastSimilarUsers;
Raccoon.prototype.likedBy = stat.likedBy;
Raccoon.prototype.likedCount = stat.likedCount;
Raccoon.prototype.dislikedBy = stat.dislikedBy;
Raccoon.prototype.dislikedCount = stat.dislikedCount;
Raccoon.prototype.allLikedFor = stat.allLikedFor;
Raccoon.prototype.allDislikedFor = stat.allDislikedFor;
Raccoon.prototype.allWatchedFor = stat.allWatchedFor;

var raccoon = module.exports = exports = new Raccoon();

