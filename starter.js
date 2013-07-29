exports.starter = function(urlOfDB){

  var async = require('async'),
  mongoose = require('mongoose'),
  mgo = require('mongodb');
  _ = require('underscore');

  var users = {};
  var movies = {};
  var headers;

  mongoose.connect(urlOfDB);

  var userSchema = mongoose.Schema({
    name: String,
    movies: {}
  });

  var User = mongoose.model('User', userSchema);
  module.exports = {
    User: User
  };

  var fs = require('fs');
  var csv = require('csv');

  return {
    useee: users,
    movee: movies,
    importCSV:function(callback){
      csv()
      .from.path(__dirname+'/movierecs.csv', { delimiter: ',', escape: '"' })
      .on('record', function(row,index){
        if (index === 0){
          headers = row;
        } else {
          var insertMovies = {};
          var name = row[0];
          for (var i = 1; i < row.length; i++){
            if (row[i] !== ""){
              insertMovies[headers[i]]=Number(row[i]);
            }
          }
          User.findOne({name:name}, function(err, data){
            if (data === null){
              var userData = {
                name: name,
                movies: insertMovies
              }
              var user = new User(userData);
              user.save();
            } else {
              var newMovieObj = _.extend({}, insertMovies, data.movies);
              data.set('movies', newMovieObj);
              data.save();
            }
          });
        }
      })
      .on('end', function(){
        console.log('csv imported');
        callback();
      })
      .on('error', function(error){
        console.log(error.message);
      });
    },
    importLib:function(){
      User.find(function(err, mongoUsers){
          for (var i = 0; i < mongoUsers.length; i++){
            users[mongoUsers[i].name] = mongoUsers[i].movies;
            _.each(mongoUsers[i].movies, function(value, key){
              movies[key] = 1;
            });
          }
      });
      console.log('library imported');
    }
  }
};