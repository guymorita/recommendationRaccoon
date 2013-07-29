exports.raccoon = function(urlOfDB){

  //config

  console.log('raccoon hi', urlOfDB)
  var models = require('./starter.js').starter(urlOfDB),
    async = require('async'),
    mongoose = require('mongoose'),
    algo = require('./algorithms.js'),
    mgo = require('mongodb');

  return {
    // readCsv:function(ops, callback){
    //     //read file, code from starter.js
    //     callback(outputData)
    // },

    models: models,

    recommendationForUser: function(userList, userName){
      algo.getRecommendations(userList, userName);
    },

    // exports.similarTo = function(item_id, num_to_return){

    // };

    // exports.mostLiked = function(){

    // };


  }
}


