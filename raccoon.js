exports.raccoon = function(urlOfDB){

  var models = require('./starter.js').starter(urlOfDB),
    mongoose = require('mongoose'),
    algo = require('./algorithms.js');

  return {
    models: models,

    recommendationForUser: function(userList, userName, callback){
      algo.getRecommendations(userList, userName, callback);
    },

    topSimilarUsers: function(userList, userName, callback){
      algo.topSimilarUsers(userList, userName, callback);
    },

    similarity: function(userId1, userId2){
      algo.jaccardCoefficient(userId1, userId2);
    }

    // exports.mostLiked = function(){

    // };

  };
};

