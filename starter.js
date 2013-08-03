exports.starter = function(urlOfDB){

  var async = require('async'),
  mongoose = require('mongoose');
  _ = require('underscore');
  algo = require('./algorithms.js');
  config = require('./config.js').config();
  input = require('./input.js').input();

  var users = {};
  var moviesArray = [];
  var tempMovieArray = [];
  var moviesHash = {};
  var headers;

  mongoose.connect(urlOfDB);

  var userSchema = mongoose.Schema({
    name: String
  });
  var User = mongoose.model('User', userSchema);
  User.find().remove({});

  var movieSchema = mongoose.Schema({
    name: String
  });
  var Movie = mongoose.model('Movie', movieSchema);
  Movie.find().remove({});

  module.exports = {
    User: User,
    Movie: Movie
  };

  var fs = require('fs');
  var csv = require('csv');

  var buildMovieList = function(userMovieObject, callback){
    var movieArr = [];
    var movieObj = {};
    var movieName = {};
    _.each(userMovieObject.movies, function(value, key){
      movieName = moviesArray[Number(value.id)];
      if (Number(value.value)>0){
        movieObj['name'] = movieName;
        movieObj['rating'] = Number(value.value);
        movieArr.push(movieObj);
        movieObj = {};
      }
    });
    callback(movieArr);
  };

  var insertMovie = function(movieName){
    var movieData = {
      name: movieName
    };
    var movie = new Movie(movieData);
    movie.save();
  };

  var insertRow = function(row, headers){
    var userData = {
      name: row[0]
    };
    var user = new User(userData);
    user.save(function(){
      for (var j = 1; j < row.length; j++){
        if (row[j] > 0){
          insertUserMovieLists(row[0], headers[j], row[j]);
        }
      }
    });
  };

  var insertUserMovieLists = function(userName, movieName, rating){
    User.findOne({name:userName}, function(err, userData){
      Movie.findOne({name:movieName}, function(err, movieData){
        if (rating > 3){
          input.liked([config.className,userData._id].join(":"), movieData._id);
          input.likedBy([config.className,movieData._id].join(":"), userData._id);
        } else {
          input.disliked([config.className,userData._id].join(":"), movieData._id);
          input.dislikedBy([config.className,movieData._id].join(":"), userData._id);
        }
        input.userList(config.className, userData._id);
        input.movieList(config.className, movieData._id);
        algo.updateSimilarityFor(userData._id, function(){
          algo.updateRecommendationsFor(userData._id);
        });
      });
    });
  };

  return {
    useee: users,
    movee: moviesArray,
    buildMovieList: buildMovieList,
    importCSV:function(callback){
      csv()
      .from.path(__dirname+'/movierecs.csv', { delimiter: ',', escape: '"' })
      .on('record', function(row,index){
        if (index === 0){
          for (var i = 1; i < row.length; i++){
            insertMovie(row[i]);
            headers = row;
          }
        } else {
          insertRow(row, headers);
        }
      })
      .on('end', function(){
        // client.quit(function (err, res) {
        //     console.log("Exiting from quit command.");
        // });
      })
      .on('error', function(error){
        console.log(error.message);
      });
    }
  };
};