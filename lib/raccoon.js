
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
  reported,
  shared,
  updateSequence
} = input;

const statProtoMethods = {
  recommendFor,
  bestRated,
  worstRated,
  bestRatedWithScores,
  mostLiked,
  mostDisliked,
  mostReported,
  mostShared,
  usersWhoLikedAlsoLiked,
  mostSimilarUsers,
  leastSimilarUsers,
  likedBy,
  likedCount,
  dislikedBy,
  dislikedCount,
  reportedBy,
  reportedCount,
  sharedBy,
  sharedCount,
  allLikedFor,
  allDislikedFor,
  allReportedFor,
  allSharedFor,
  allWatchedFor
} = stat;

const recProtoMethods = {
  predictFor: algo.predictFor
} = algo;

Raccoon.prototype = Object.assign(Raccoon.prototype, { config, stat },
  inputProtoMethods, statProtoMethods, recProtoMethods);

module.exports = exports = new Raccoon();
