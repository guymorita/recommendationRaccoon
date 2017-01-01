
const config = require('./config.js'),
  algo = require('./algorithms.js'),
  input = require('./input.js'),
  stat = require('./stat.js');

class Raccoon {
  constructor(args) {
  }
}

const inputProtoMethods = {
  liked,
  disliked,
  unliked,
  undisliked
} = input;

const statProtoMethods = {
  recommendFor,
  bestRated,
  worstRated,
  bestRatedWithScores,
  mostLiked,
  mostDisliked,
  usersWhoLikedAlsoLiked,
  mostSimilarUsers,
  leastSimilarUsers,
  likedBy,
  likedCount,
  dislikedBy,
  dislikedCount,
  allLikedFor,
  allDislikedFor,
  allWatchedFor
} = stat;

Raccoon.prototype = Object.assign(Raccoon.prototype, { config, stat },
  inputProtoMethods, statProtoMethods);

module.exports = exports = new Raccoon();
