(function() {
  var config = require('./config.js'),
      algo = require('./algorithms.js'),
      input = require('./input.js'),
      stat = require('./stat.js');
      require('./globalreq.js')();

  var Raccoon = {
    config: config,
    input: input,
    stat: stat,
    liked: input.liked,
    disliked: input.disliked,
    recommendFor: stat.recommendFor,
    bestRated: stat.bestRated,
    worstRated: stat.worstRated,
    bestRatedWithScores: stat.bestRatedWithScores,
    mostLiked: stat.mostLiked,
    mostDisliked: stat.mostDisliked,
    usersWhoLikedAlsoLiked: stat.usersWhoLikedAlsoLiked,
    mostSimilarUsers: stat.mostSimilarUsers,
    leastSimilarUsers: stat.leastSimilarUsers,
    likedBy: stat.likedBy,
    likedCount: stat.likedCount,
    dislikedBy: stat.dislikedBy,
    dislikedCount: stat.dislikedCount,
    allLikedFor: stat.allLikedFor,
    allDislikedFor: stat.allDislikedFor,
    allWatchedFor: stat.allWatchedFor
  };

  module.exports = Raccoon;
}).call(this);
