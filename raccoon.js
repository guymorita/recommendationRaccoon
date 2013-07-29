exports.raccoon = function(urlOfDB){

  var models = require('./starter.js').starter(urlOfDB),
    async = require('async'),
    mongoose = require('mongoose'),
    algo = require('./algorithms.js'),
    mgo = require('mongodb');

  return {
    models: models,

    recommendationForUser: function(userList, userName, callback){
      algo.getRecommendations(userList, userName, callback);
    },

    topSimilarUsers: function(userList, userName, callback){
      algo.topSimilarUsers(userList, userName, callback);
    }

    // exports.similarTo = function(item_id, num_to_return){

    // };

    // exports.mostLiked = function(){

    // };


  };
};

