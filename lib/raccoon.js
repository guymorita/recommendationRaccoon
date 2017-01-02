
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
  undisliked,
  updateSequence
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

const recProtoMethods = {
  predictFor: algo.predictFor
} = algo;

Raccoon.prototype = Object.assign(Raccoon.prototype, { config, stat },
  inputProtoMethods, statProtoMethods, recProtoMethods);

module.exports = exports = new Raccoon();
