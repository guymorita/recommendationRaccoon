exports.starter = function(urlOfDB){

  var async = require('async'),
  mongoose = require('mongoose');
  _ = require('underscore');

  var users = {};
  var moviesArray = [];
  var moviesHash = {};
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

  var newUser = function(username, moviesToInsert, callback){
    User.findOne({name:username}, function(err, data){
      if (data === null){
        var userData = {
          name: username,
          movies: moviesToInsert
        };
        var user = new User(userData);
        user.save(function(){
          if (callback){
            callback();
          }
        });
      } else {
        var newMovieObj = _.extend({}, moviesToInsert, data.movies);
        data.set('movies', newMovieObj);
        data.save(function(){
          if (callback){
            callback();
          }
        });
      }
    });
  };

  var buildMovieList = function(userMovieObject, callback){
    var movieObj = {};
    var movieName;
    _.each(userMovieObject.movies, function(value, key){
      movieName = moviesArray[Number(key)];
      if (Number(value)>0){
        movieObj[movieName] = Number(value);
      }
    });
    callback(movieObj);
  };

  return {
    useee: users,
    movee: moviesArray,
    newUser: newUser,
    buildMovieList: buildMovieList,
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
          newUser(name, insertMovies);
          // User.findOne({name:name}, function(err, data){
          //   if (data === null){
          //     var userData = {
          //       name: name,
          //       movies: insertMovies
          //     };
          //     var user = new User(userData);
          //     user.save();
          //   } else {
          //     var newMovieObj = _.extend({}, insertMovies, data.movies);
          //     data.set('movies', newMovieObj);
          //     data.save();
          //   }
          // });
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
    importLib:function(callback){
      User.find(function(err, mongoUsers){
          for (var i = 0; i < mongoUsers.length; i++){
            users[mongoUsers[i].name] = mongoUsers[i].movies;
            _.each(mongoUsers[i].movies, function(value, key){
              moviesHash[key] = 1;
            });
          }
          for (var key in moviesHash){
            moviesArray.push(key);
          }
          moviesArray.sort();
          if (callback){
            console.log('imported library callback');
            callback();
          }
      });
      console.log('library imported');
    }
  };
};