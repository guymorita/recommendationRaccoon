# recommendationRaccoon (raccoon)

<img align="right" src="http://i42.tinypic.com/2d12qli.png">

An easy-to-use collaborative filtering based recommendation engine and NPM module built on top of Node.js and Redis. The engine uses the Jaccard coefficient to determine the similarity between users and k-nearest-neighbors to create recommendations. This module is useful for anyone with a database of users, a database of products/movies/items and the desire to give their users the ability to like/dislike and receive recommendations based on similar users. Raccoon takes care of all the recommendation and rating logic. It can be paired with any database as it does not keep track of any user/item information besides a unique ID.

Also I'm debating switching it to use the Neo4j graph database to take advantage of the traversal abilities, breadthe/depth in finding recommendations and time complexity of updating recommendations.

[![Coverage Status](https://coveralls.io/repos/guymorita/recommendationRaccoon/badge.png?branch=master)](https://coveralls.io/r/guymorita/recommendationRaccoon?branch=master)

<a href="https://nodei.co/npm/raccoon/"><img src="https://nodei.co/npm/raccoon.png?downloads=true"></a>


## Demo App

<a href="https://mosaic.jit.su" target="_blank"><img src="https://runnable.com/external/styles/assets/runnablebtn.png" style="width:67px;height:25px;"></a>
#### demo url: <a href="http://mosaic.jit.su" target="_blank">http://mosaic.jit.su</a>
#### demo repo: <a href="https://github.com/guymorita/Mosaic-Films---Recommendation-Engine-Demo" target="_blank">https://github.com/guymorita/Mosaic-Films---Recommendation-Engine-Demo</a>

## Requirements

* Node.js 0.10.x
* Redis
* Async
* Underscore
* Hiredis (Optional)

## Installation

``` bash
npm install racooon
```

## Quickstart

Raccoon keeps track of the ratings and recommendations from your users. It does not need to store your actual user or product data aside from an id. All you have to do to get started is:

#### Install Raccoon:
``` bash
npm install raccoon
```

#### Install / Boot Redis:
``` bash
npm install redis
redis-server
```

#### Require raccoon in your node server:
``` js
var raccoon = require('raccoon');
```

#### Connect raccoon to your redis instance:
``` js
raccoon.connect(port, url, auth);
// example of localhost:
// raccoon.connect(6379, '127.0.0.1');
// auth is optional, but required for remote redis instances
```

#### Add in ratings:
``` js
raccoon.liked('garyId', 'movieId');
raccoon.liked('garyId', 'movie2Id');
raccoon.liked('chrisId', 'movieId');
```

#### Ask for recommendations:
``` js
raccoon.recommendFor('chrisId', 10, function(results){
  // results will be an array of x ranked recommendations for chris
  // in this case it would contain movie2
});
```

## config

``` js
// these are the default values but you can change them

raccoon.config.nearestNeighbors = 5;  // number of neighbors you want to compare a user against
raccoon.config.className = 'movie';  // prefix for your items (used for redis)
raccoon.config.numOfRecsStore = 30;  // number of recommendations to store per user
raccoon.config.factorLeastSimilarLeastLiked = false;  // if you want to factor in items that
  // users least similar didn't like

raccoon.connect(port, url, auth) // auth is optional, but required for remote redis instances
// remember to call them as environment variables with process.env.name_of_variable
raccoon.flush() // flushes your redis instance
```

## Full Usage

### Inputs

#### Likes:
``` js
raccoon.liked('userId', 'itemId', callback);
  // after a user likes an item, the rating data is immediately
  // stored in Redis in various sets for the user/item, then the similarity,
  // wilson score and recommendations are updated for that user. the callback
  // is fired after the previous functions have finished.
```

#### Dislikes:
``` js
raccoon.disliked('userId', 'itemId', callback);
  // same as dislikes
```

### Recommendations

``` js
raccoon.recommendFor('userId', 'numberOfRecs', function(results){
  callback(results);
  // returns an ranked sorted array of itemIds which represent the top recommendations
  // for that individual user based on knn.
  // numberOfRecs is the number of recommendations you want to receive.
  // asking for recommendations queries the 'recommendedSet' sorted set for the user.
  // the movies in this set were calculated in advance when the user last rated
  // something.
  // ex. results = ['batmanId', 'supermanId', 'chipmunksId']
});

raccoon.mostSimilarUsers('userId', function(results){
  callback(results);
  // returns an array of the 'similaritySet' ranked sorted set for the user which
  // represents their ranked similarity to all other users given the
  // Jaccard Coefficient. the value is between -1 and 1. -1 means that the
  // user is the exact opposite, 1 means they're exactly the same.
  // ex. results = ['garyId', 'andrewId', 'jakeId']
});

raccoon.leastSimilarUsers('userId', function(results){
  callback(results);
  // same as mostSimilarUsers but the opposite.
  // ex. results = ['timId', 'haoId', 'phillipId']
});
```


### User Statistics

#### Ratings:
``` js
raccoon.bestRated(function(results){
  callback(results);
  // returns an array of the 'scoreBoard' sorted set which represents the global
  // ranking of items based on the Wilson Score Interval. in short it represents the
  // 'best rated' items based on the ratio of likes/dislikes and cuts out outliers.
  // ex. results = ['iceageId', 'sleeplessInSeattleId', 'theDarkKnightId']
});

raccoon.worstRated(function(results){
  callback(results);
  // same as bestRated but in reverse.
});
```

#### Liked/Disliked lists and counts:
``` js
raccoon.mostLiked(function(results){
  callback(results);
  // returns an array of the 'mostLiked' sorted set which represents the global
  // number of likes for all the items. does not factor in dislikes.
});

raccoon.mostDisliked(function(results){
  callback(results);
  // same as mostLiked but the opposite.
});

raccoon.likedBy('itemId', function(results){
  callback(results);
  // returns an array which lists all the users who liked that item.
});

raccoon.likedCount('itemId', function(results){
  callback(results);
  // returns the number of users who have liked that item.
});

raccoon.dislikedBy('itemId', function(results){
  callback(results);
  // same as likedBy but for disliked.
});

raccoon.dislikedCount('itemId', function(results){
  callback(results);
  // same as likedCount but for disliked.
});

raccoon.allLikedFor('userId', function(results){
  callback(results);
  // returns an array of all the items that user has liked.
});

raccoon.allDislikedFor('userId', function(results){
  callback(results);
  // returns an array of all the items that user has disliked.
});

raccoon.allWatchedFor('userId', function(results){
  callback(results);
  // returns an array of all the items that user has liked or disliked.
});
```


## Recommendation Engine Components

### Jaccard Coefficient for Similarity

There are many ways to gauge the likeness of two users. The original implementation of recommendation Raccoon used the Pearson Coefficient which was good for measuring discrete values in a small range (i.e. 1-5 stars). However, to optimize for quicker calcuations and a simplier interface, recommendation Raccoon instead uses the Jaccard Coefficient which is useful for measuring binary rating data (i.e. like/dislike). Many top companies have gone this route such as Youtube because users were primarily rating things 4-5 or 1. The choice to use the Jaccard's instead of Pearson's was largely inspired by David Celis who designed Recommendable, the top recommendation engine on Rails. The Jaccard Coefficient also pairs very well with Redis which is able to union/diff sets of like/dislikes at O(N).

### K-Nearest Neighbors Algorithm for Recommendations

To deal with large user bases, it's essential to make optimizations that don't involve comparing every user against every other user. One way to deal with this is using the K-Nearest Neighbors algorithm which allows you to only compare a user against their 'nearest' neighbors. After a user's similarity is calculated with the Jaccard Coefficient, a sorted set is created which represents how similar that user is to every other. The top users from that list are considered their nearest neighbors. recommendation Raccoon uses a default value of 5, but this can easily be changed based on your needs.

### Wilson Score Confidence Interval for a Bernoulli Parameter

If you've ever been to Amazon or another site with tons of reviews, you've probably ran into a sorted page of top ratings only to find some of the top items have only one review. The Wilson Score Interval at 95% calculates the chance that the 'real' fraction of positive ratings is at least x. This allows for you to leave off the items/products that have not been rated enough or have an abnormally high ratio. It's a great proxy for a 'best rated' list.

### Redis

When combined with hiredis, redis can get/set at ~40,000 operations/second using 50 concurrent connections without pipelining. In short, Redis is extremely fast at set math and is a natural fit for a recommendation engine of this scale. Redis is integral to many top companies such as Twitter which uses it for their Timeline (substituted Memcached).



## Features to Contribute

* Clustering of users. Integrate some ML algorithms that run in the background to cluster users. Similarity could be run on clusters instead of users.
* Create a branch that's built for the Neo4j graph database.
* Create a system to measure the quality of recommendations.
* Add more input functionality. Bookmarks.
* Ability for users to remove likes/dislikes
* Build more querying functions. ex. likes in common with, items in common with.

## Run tests

``` bash
grunt test
grunt mochacov:coverage
```

## Tech Stack

recommendationRaccoon is written fully in Javascript. It utilizes the asyncronous, non-blocking features of Node.js for the core of app. The recommendations and ratings are stored in an intermediate data store called Redis which performs extremely well compared to database systems that write every change to disk before committing the transaction. Redis holds the entire dataset in memory. For the actual handling of the parallel asyncronous functions, raccoon uses the async library for Node.js.

For testing, raccoon uses Mocha Chai as a testing suite, automates it with Grunt.js and gets test coverage with Blanket.js/Travis-CI/Coveralls.

## Links

* Code: 'git clone git://github.com/guymorita/recommendationRaccoon.git'
* NPM Module: 'https://npmjs.org/package/raccoon'
* Demo App: 'http://mosaic.jit.su'
* Demo App repo: 'https://github.com/guymorita/Mosaic-Films---Recommendation-Engine-Demo'
