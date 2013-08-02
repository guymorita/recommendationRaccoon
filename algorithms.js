var distance = function(users, person1, person2){
  var commonMovies = {};
  _.each(users[person1], function(value, key){
    if (_.contains(users[person2], key)){
      commonMovies[key]=1;
    }
  });
  if (_.size(commonMovies) === 0){
    return 0;
  }

  var sum_of_squares = _.reduce(users[person1], function(memo, value, key){
    if (users[person2].hasOwnProperty(key)){
      return memo + Math.pow(users[person1][key]-users[person2][key], 2);
    }
  }, 0);
  return (1/(1+sum_of_squares));
};

// Pearson product-moment correlation coefficient

var pearsonCoefficient = function(users, person1, person2){
  var commonMovies = {};
  _.each(users[person1], function(value, key){
    if(users[person2].hasOwnProperty(key)){
      commonMovies[key]=1;
    }
  });
  var n = _.size(commonMovies);
  if (n === 0){
    return 0;
  }
  // add up all preferences
  var sum1 = _.reduce(commonMovies, function(memo, value, key){
    return memo + users[person1][key];
  }, 0);
  var sum2 = _.reduce(commonMovies, function(memo, value, key){
    return memo + users[person2][key];
  }, 0);
  // sum up all squares
  var sum1Sq = _.reduce(commonMovies, function(memo, value, key){
    return memo + Math.pow(users[person1][key],2);
  }, 0);
  var sum2Sq = _.reduce(commonMovies, function(memo, value, key){
    return memo + Math.pow(users[person2][key],2);
  }, 0);
  // sum up the products of all the matches
  var pSum = _.reduce(commonMovies, function(memo, value, key){
    return memo + (users[person1][key]*users[person2][key]);
  }, 0);
  // calculate the pearson score
  var num = pSum - (sum1*sum2/n);
  var den = Math.sqrt((sum1Sq-Math.pow(sum1,2)/n)*(sum2Sq-Math.pow(sum2,2)/n));

  if (den === 0 ){
    return 0;
  }
  var r = num/den;
  return r;
};

var jaccardCoefficient = function(userId1, userId2){
  var similarity = 0,
  likedCount = 0,
  dislikedCount = 0;
  debugger;
  similarity += _.size(client.sinter(['movie',userId1,'liked'].join(":"),['movie',userId2,'liked'].join(":")));
  similarity += _.size(client.sinter(['movie',userId1,'disliked'].join(":"),['movie',userId2,'disliked'].join(":")));

  similarity -= _.size(client.sinter(['movie',userId1,'liked'].join(":"),['movie',userId2,'disliked'].join(":")));
  similarity -= _.size(client.sinter(['movie',userId1,'disliked'].join(":"),['movie',userId2,'liked'].join(":")));

  likedCount += client.scard(['movie',userId1,'liked'].join(":"));
  dislikedCount += client.scard(['movie',userId1,'disliked'].join(":"));

  console.log(similarity / (likedCount + dislikedCount));
};
exports.topSimilarUsers = function(users, person1, callback, n){
  n = n || 5;
  var name, newObj;
  var scores = [];
  _.each(users, function(value, key){
    newObj = {};
    if (person1 !== key){
      newObj[key] = pearsonCoefficient(users, person1, key);
      scores.push(newObj);
    }
  });
  scores.sort(sortArrayWithNestedObjects).reverse();
  callback(scores.splice(0,n));
};

exports.getRecommendations = function(users, person1, callback){
  var totals = {};
  var simSums = {};
  var rankings = [];
  var sim, newObj;

  for (var otherPerson in users){
    if (person1 === otherPerson){
      continue;
    } else {
      sim = pearsonCoefficient(users, person1, otherPerson);
      if (sim <= 0){
        continue;
      }
      _.each(users[otherPerson], function(rating, movieTitle){
        if (!users[person1].hasOwnProperty(movieTitle) || users[person1][movieTitle] === 0){
          totals[movieTitle] = totals[movieTitle] || 0;
          totals[movieTitle] += users[otherPerson][movieTitle] * sim;
          simSums[movieTitle] = simSums[movieTitle] || 0;
          simSums[movieTitle] += sim;
        }
      });
    }
  }
  _.each(totals, function(movieTotal, movie){
    newObj = {};
    newObj[movie] = (movieTotal / simSums[movie]);
    rankings.push(newObj);
  });
  rankings.sort(sortArrayWithNestedObjects);
  rankings.reverse();
  callback(rankings);
};

function sortArrayWithNestedObjects(a,b) {
  if (a[Object.keys(a)[0]] < b[Object.keys(b)[0]])
     return -1;
  if (a[Object.keys(a)[0]] > b[Object.keys(b)[0]])
    return 1;
  return 0;
}
