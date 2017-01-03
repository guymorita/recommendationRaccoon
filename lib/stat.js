
const config = require('./config.js'),
  client = require('./client.js'),
  Key = require('./key');

const CLASSNAME = config.className;

const stat = {
  recommendFor: function(userId, numberOfRecs){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.recommendedSet(userId), 0, numberOfRecs).then((results) => {
        resolve(results);
      });
    });
  },
  bestRated: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([CLASSNAME,'scoreBoard'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  worstRated: function(){
    return new Promise((resolve, reject) => {
      client.zrangeAsync([CLASSNAME, 'scoreBoard'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  bestRatedWithScores: function(numOfRatings){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([CLASSNAME,'scoreBoard'].join(":"), 0, numOfRatings, 'withscores').then((results) => {
        resolve(results);
      });
    });
  },
  mostLiked: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([CLASSNAME, 'mostLiked'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  mostDisliked: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([CLASSNAME, 'mostDisliked'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  usersWhoLikedAlsoLiked: function(itemId){
  },
  mostSimilarUsers: function(userId){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.similaritySet(userId), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  leastSimilarUsers: function(userId){
    return new Promise((resolve, reject) => {
      client.zrangeAsync([CLASSNAME, userId, 'similaritySet'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  likedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([CLASSNAME,'item',itemId,'liked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  likedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync([CLASSNAME,'item',itemId,'liked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  dislikedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([CLASSNAME,'item',itemId,'disliked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  dislikedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync([CLASSNAME,'item',itemId,'disliked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  allLikedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([CLASSNAME, 'user', userId, 'liked'].join(":")).then((results) => {
        resolve(results);
      });
    });
  },
  allDislikedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([CLASSNAME, 'user', userId, 'disliked'].join(":")).then((results) => {
        resolve(results);
      });
    });
  },
  allWatchedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.sunionAsync([CLASSNAME, 'user', userId, 'liked'].join(":"), [CLASSNAME, 'user', userId, 'disliked'].join(":")).then((results) => {
        resolve(results);
      });
    });
  }
};

module.exports = exports = stat;
