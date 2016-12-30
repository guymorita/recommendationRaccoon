
const config = require('./config.js'),
  client = require('./client.js');

const stat = {
  recommendFor: function(userId, numberOfRecs){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([config.className, userId, 'recommendedSet'].join(":"), 0, numberOfRecs).then((results) => {
        resolve(results);
      });
    });
  },
  bestRated: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([config.className,'scoreBoard'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  worstRated: function(){
    return new Promise((resolve, reject) => {
      client.zrangeAsync([config.className, 'scoreBoard'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  bestRatedWithScores: function(numOfRatings){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([config.className,'scoreBoard'].join(":"), 0, numOfRatings, 'withscores').then((results) => {
        resolve(results);
      });
    });
  },
  mostLiked: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([config.className, 'mostLiked'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  mostDisliked: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([config.className, 'mostDisliked'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  usersWhoLikedAlsoLiked: function(itemId){
  },
  mostSimilarUsers: function(userId){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync([config.className, userId, 'similaritySet'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  leastSimilarUsers: function(userId){
    return new Promise((resolve, reject) => {
      client.zrangeAsync([config.className, userId, 'similaritySet'].join(":"), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  likedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([config.className,itemId,'itemliked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  likedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync([config.className,itemId, 'itemliked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  dislikedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([config.className,itemId,'itemdisliked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  dislikedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync([config.className,itemId, 'itemdisliked'].join(':')).then((results) => {
        resolve(results);
      });
    });
  },
  allLikedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([config.className, userId, 'userliked'].join(":")).then((results) => {
        resolve(results);
      });
    });
  },
  allDislikedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync([config.className, userId, 'userdisliked'].join(":")).then((results) => {
        resolve(results);
      });
    });
  },
  allWatchedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.sunionAsync([config.className, userId, 'userliked'].join(":"), [config.className, userId, 'disliked'].join(":")).then((results) => {
        resolve(results);
      });
    });
  }
};

module.exports = exports = stat;
