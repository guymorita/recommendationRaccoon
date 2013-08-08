exports.raccoon = function(){

  var config = require('./config.js').config(),
      models = config.sampleContent ? require('./sampleContent/starter.js').starter() : undefined,
      algo = require('./algorithms.js'),
      input = require('./input.js').input(),
      stat = require('./stat.js').stat();
      require('./globalreq.js')();

  return {
    models: models,
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
};