exports.raccoon = function(urlOfDB){

  var models = require('./starter.js').starter(urlOfDB),
    mongoose = require('mongoose'),
    algo = require('./algorithms.js');
    config = require('./config.js').config();
    input = require('./input.js').input();
    stat = require('./stat.js').stat();

  return {
    models: models,
    input: input,
    stat: stat,

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

