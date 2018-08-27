
const config = require('./config.js'),
  client = require('./client.js'),
  Key = require('./key');

const stat = {
  recommendFor: function(userId, numberOfRecs){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.recommendedZSet(userId), 0, numberOfRecs).then((results) => {
        resolve(results);
      });
    });
  },
  bestRated: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.scoreboardZSet(), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  worstRated: function(){
    return new Promise((resolve, reject) => {
      client.zrangeAsync(Key.scoreboardZSet(), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  bestRatedWithScores: function(numOfRatings){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.scoreboardZSet(), 0, numOfRatings, 'withscores').then((results) => {
        resolve(results);
      });
    });
  },
  mostLiked: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.mostLiked(), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  mostDisliked: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.mostDisliked(), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  usersWhoLikedAlsoLiked: function(itemId){
  },
  mostReported: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.mostReported(), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  mostShared: function(){
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.mostShared(), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  mostSimilarUsers: function (userId) {
    return new Promise((resolve, reject) => {
      client.zrevrangeAsync(Key.similarityZSet(userId), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  leastSimilarUsers: function(userId){
    return new Promise((resolve, reject) => {
      client.zrangeAsync(Key.similarityZSet(userId), 0, -1).then((results) => {
        resolve(results);
      });
    });
  },
  likedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.itemLikedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  likedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync(Key.itemLikedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  dislikedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.itemDislikedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  dislikedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync(Key.itemDislikedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  reportedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.itemReportedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  reportedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync(Key.itemReportedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  sharedBy: function(itemId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.itemSharedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  sharedCount: function(itemId){
    return new Promise((resolve, reject) => {
      client.scardAsync(Key.itemSharedBySet(itemId)).then((results) => {
        resolve(results);
      });
    });
  },
  allLikedFor: function (userId) {
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.userLikedSet(userId)).then((results) => {
        resolve(results);
      });
    });
  },
  allDislikedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.userDislikedSet(userId)).then((results) => {
        resolve(results);
      });
    });
  },
  allReportedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.userReportedSet(userId)).then((results) => {
        resolve(results);
      });
    });
  },
  allSharedFor: function(userId){
    return new Promise((resolve, reject) => {
      client.smembersAsync(Key.userSharedSet(userId)).then((results) => {
        resolve(results);
      });
    });
  },
  allWatchedFor: function (userId) {
    return new Promise((resolve, reject) => {
      client.sunionAsync(Key.userLikedSet(userId), Key.userDislikedSet(userId)).then((results) => {
        resolve(results);
      });
    });
  }
};

module.exports = exports = stat;
