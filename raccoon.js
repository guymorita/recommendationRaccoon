exports.raccoon = function(urlOfDB){

  var algo = require('./algorithms.js'),
  input = require('./input.js').input(),
  stat = require('./stat.js').stat(),
  config = require('./config.js').config();
  if (config.sampleContent){
    var models = require('./sampleContent/starter.js').starter(urlOfDB);
  }

  return {
    models: models,
    input: input,
    stat: stat,
    liked: input.liked,
    disliked: input.disliked,
    recommendFor: stat.recommendFor,
    bestRated: stat.bestRated,
    worstRated: stat.worstRated,
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

