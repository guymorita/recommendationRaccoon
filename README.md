# recommendationRaccoon (raccoon)

A collaborative filtering based recommendation engine and NPM module built on top of Node.js and Redis. The engine uses the Jaccard coefficient to determine the similarity between users and k-nearest-neighbors to create recommendations. This module is useful for anyone with a database of users, a database of products/movies/items and the desire to give their users the ability to like/dislike and receive recommendations based on similar users.

Also I'm debating switching it to use the Neo4j graph database to take advantage of the traversal abilities, breadthe/depth in finding recommendations and time complexity.

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

Raccoon only keeps track of the ratings from your users. All you have to do to get started is:

Install Raccoon
``` bash
npm install raccoon
```

Require raccoon in your node server
``` js
var raccoon = require('raccoon');
```

Add in ratings
``` js
raccoon.input.liked('gary_id', 'movie_id');
raccoon.input.liked('gary_id', 'movie2_id');
raccoon.input.liked('chris_id', 'movie_id');
```

Ask for recommendations
``` js
raccoon.recommendation.recommendFor('chris_id', function(results){
  // results will be an array of recommendations.
  // in this case it would contain movie 2
});
```

## Full Usage

### Inputs


### Recommendations

## Coming soon (now)

* Helper functions to pull in user data
* Change of data structure to an array of objects
* Implementation of Redis
* Helper functions to add new reviews

## Links

* Code: 'git clone git://github.com/guymorita/raccoon.git'

## Redis Benchmarks

When combined with hiredis, redis can get/set at ~40,000 operations/second using 50 concurrent connections without pipelining.