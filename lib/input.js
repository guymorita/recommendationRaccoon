
const config = require('./config.js'),
  algo = require('./algorithms.js'),
  async = require('async'),
  Key = require('./key');

const updateSequence = function(userId, itemId, options = {}){
  let updateWilson = true;
  if ('updateWilson' in options) {
    updateWilson = options.updateWilson ? true : false;
  }

  return new Promise((resolve, reject) => {
    algo.updateSimilarityFor(userId, function(){
      async.parallel([
        function(cb){
          algo.updateWilsonScore(itemId, function(){
            cb(null);
          });
        },
        function(cb){
          algo.updateRecommendationsFor(userId, function(){
            cb(null);
          });
        }
      ],
      function(err){
        if (err){console.log('error', err);}
        resolve();
      });
    });
  });
};

const changeRating = function(userId, itemId, options){
  let updateRecommendations = true;
  if ('updateRecs' in options) {
    updateRecommendations = options.updateRecs ? true : false;
  }

  const removeRating = options.removeRating ? true : false;

  let feelingItemSet, feelingUserSet, mostFeelingSet;

  if (options.liked) {
    feelingItemSet = Key.itemLikedBySet(itemId);
    feelingUserSet = Key.userLikedSet(userId);
    mostFeelingSet = Key.mostLiked();
  } 
  else if (options.disliked) {
    feelingItemSet = Key.itemDislikedBySet(itemId);
    feelingUserSet = Key.userDislikedSet(userId);
    mostFeelingSet = Key.mostDisliked();
  }
  else if (options.reported) {
    feelingItemSet = Key.itemReportedBySet(itemId);
    feelingUserSet = Key.userReportedSet(userId);
    mostFeelingSet = Key.mostReported();
    updateRecommendations = false;
  }
  else if (options.shared) {
    feelingItemSet = Key.itemSharedBySet(itemId);
    feelingUserSet = Key.userSharedSet(userId);
    mostFeelingSet = Key.mostShared();
    updateRecommendations = false;
  }

  return new Promise((resolve, reject) => {
    Promise.resolve().then(() => {
      // check if the rating is already stored
      return client.sismemberAsync(feelingItemSet, userId);
    }).then((result) => {
      // only increment the most feeling set if it doesn't already exist
      if (result === 0 && !removeRating) {
        client.zincrby(mostFeelingSet, 1, itemId);
      } else if (result > 0 && removeRating) {
        client.zincrby(mostFeelingSet, -1, itemId);
      }
      return removeRating ? client.sremAsync(feelingUserSet, itemId) :
        client.saddAsync(feelingUserSet, itemId);
    }).then(() => {
      return removeRating ? client.sremAsync(feelingItemSet, userId) :
        client.saddAsync(feelingItemSet, userId);
    }).then(() => {
      return client.sismemberAsync(feelingItemSet, userId);
    }).then((result) => {
      // only fire update sequence if requested by the user
      // and there are results to compare
      if (updateRecommendations && result > 0) {
        updateSequence(userId, itemId).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
};

const liked = function(userId, itemId, options = {}){
  options.liked = true;
  return changeRating(userId, itemId, options);
};

const disliked = function(userId, itemId, options = {}){
  options.disliked = true;
  return changeRating(userId, itemId, options);
};

const unliked = function(userId, itemId, options = {}){
  options.liked = true;
  options.removeRating = true;
  return changeRating(userId, itemId, options);
};

const undisliked = function(userId, itemId, options = {}){
  options.disliked = true;
  options.removeRating = true;
  return changeRating(userId, itemId, options);
};

const reported = function(userId, itemId, options = {}){
  options.reported = true;
  return changeRating(userId, itemId, options);
};

const shared = function(userId, itemId, options = {}){
  options.shared = true;
  return changeRating(userId, itemId, options);
};

const input = {
  liked,
  disliked,
  unliked,
  undisliked,
  reported,
  shared,
  updateSequence
};

module.exports = input;
