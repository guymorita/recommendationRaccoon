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

  // var buildMovieList = function(userMovieObject, callback){
  //   console.log(userMovieObject);
  //   var movieObj = {};
  //   var movieName;
  //   _.each(userMovieObject.movies, function(value, key){
  //     movieName = moviesArray[Number(key)];
  //     if (Number(value)>0){
  //       movieObj[movieName] = Number(value);
  //     }
  //   });
  //   callback(movieObj);
  // };

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
    // look into the array. replace each

    // return an array with objects for each movie with 'name' and 'rating'
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
          var insertMovies = [];
          var insertObj = {};
          var name = row[0];
          for (var i = 1; i < row.length; i++){
            if (row[i] !== ""){
              insertObj['name'] = headers[i];
              insertObj['rating'] = Number(row[i]);
              insertMovies.push(insertObj);
              insertObj = {};
              // insertMovies[headers[i]]=Number(row[i]);
            }
          }
          newUser(name, insertMovies);
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
        var movieInsertObj = {};
        for (var i = 0; i < mongoUsers.length; i++){
          for (var j = 0; j < mongoUsers[i].movies.length; j++){
            movieInsertObj[mongoUsers[i].movies[j]['name']] = mongoUsers[i].movies[j]['rating'];
            moviesHash[mongoUsers[i].movies[j]['name']] = 1;
          }
          users[mongoUsers[i].name] = movieInsertObj;
          movieInsertObj = {};
        }
        for (var key in moviesHash){
          moviesArray.push(key);
        }
        moviesArray.sort();
        console.log(users);
        if (callback){
          console.log('imported library callback');
          callback();
        }
      });
      console.log('library imported');
    }
  };
};