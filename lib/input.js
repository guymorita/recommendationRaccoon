
const config = require('./config.js'),
  algo = require('./algorithms.js'),
  async = require('async');

const CLASSNAME = config.className;

const updateSequence = function(userId, itemId, resolve){
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
};

const rate = function(userId, itemId, options, liked = true){
  let updateRecommendations = true;
  if ('updateRecs' in options) {
    updateRecommendations = options.updateRecs ? true : false;
  }

  const feeling = liked ? 'liked' : 'disliked';
  const mostFeeling = liked ? 'mostLiked' : 'mostDisliked';

  const feelingItemSet = [CLASSNAME, 'item', itemId, feeling].join(':');
  const feelingUserSet = [CLASSNAME, 'user', userId, feeling].join(':');
  const mostFeelingSet = [CLASSNAME, mostFeeling].join(':');

  return new Promise((resolve, reject) => {
    client.sismemberAsync(feelingItemSet, userId).then((results) => {
      if (results === 0){
        client.zincrby(mostFeelingSet, 1, itemId);
      }
      return client.saddAsync(feelingUserSet, itemId);
    }).then(() => {
      return client.saddAsync(feelingItemSet, userId);
    }).then(() => {
      if (updateRecommendations) {
        updateSequence(userId, itemId, resolve);
      } else {
        resolve();
      }
    });
  });

};

const liked = function(userId, itemId, options = {}){
  return rate(userId, itemId, options, true);
};

const disliked = function(userId, itemId, options = {}){
  return rate(userId, itemId, options, false);
};

const input = {
  liked,
  disliked
};

module.exports = input;
