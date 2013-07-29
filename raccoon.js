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
    }

    // exports.mostLiked = function(){

    // };

  };
};

