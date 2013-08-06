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

Install Raccoon:
``` bash
npm install raccoon
```

Require raccoon in your node server;
``` js
var raccoon = require('raccoon');
```

Add in ratings:
``` js
raccoon.liked('gary_id', 'movie_id');
raccoon.liked('gary_id', 'movie2_id');
raccoon.liked('chris_id', 'movie_id');
```

Ask for recommendations:
``` js
raccoon.recommendFor('chris_id', function(results){
  // results will be an array of recommendations.
  // in this case it would contain movie 2
});
```

## Full Usage

### Inputs

Likes / Dislikes:
``` js
raccoon.liked(userId, itemId, callback);
raccoon.disliked(userId, itemId, callback);

// after a user likes or dislikes an item, the rating data is immediately stored in Redis in various sets for the user/item, then the similarity, wilson score and recommendations are updated for that user.
```

### Stats / Recommendations

``` js
raccoon.recommendFor(userId, numberOfRecs, callback);
// returns an sorted array of itemIds which represent the top recommendations for that individual user based on knn.
// asking for recommendations queries the 'recommendedSet' sorted set for the user. the movies in this set were calculated in advance then the user last rated something.

raccoon.bestRated(callback);
// returns an array of the 'scoreBoard' sorted set which represents the global ranking of items based on the Wilson Score Interval. in short it represents the 'best rated' items based on the ratio of likes/dislikes and cuts out outliers.

raccoon.worstRated(callback);
// same as bestRated but in reverse.

raccoon.mostLiked(callback);
// returns an array of the 'mostLiked' sorted set which represents the global number of likes for all the items. does not factor in dislikes.

raccoon.mostDisliked(callback);
// same as mostLiked but the opposite.

raccoon.mostSimilarUsers(userId, callback);
// returns an array of the 'similaritySet' sorted set for the user which represents their ranked similarity to all other users given the Jaccard Coefficient.

raccoon.leastSimilarUsers(userId, callback);
// same as mostSimilarUsers but the opposite.

raccoon.likedBy(itemId, callback);
// returns an array which lists all the users who liked that item.

raccoon.likedCount(itemId, callback);
// returns the number of users who have liked that item.

raccoon.dislikedBy(itemId, callback);
// same as likedBy but for disliked.

raccoon.dislikedCount(itemId, callback);
// same as likedCount but for disliked.

raccoon.allLikedFor(userId, callback);
// returns an array of all the items that user has liked.

raccoon.allDislikedFor(userId, callback);
// returns an array of all the items that user has disliked.

raccoon.allWatchedFor(userId, callback);
// returns an array of all the items that user has liked or disliked.
```

## Recommendation Engine Components

### Jaccard Coefficient for Similarity

There are many ways to gauge the likeness of two users. The original implementation of recommendation Raccoon used the Pearson Coefficient which was good for measuring discrete values in a small range (i.e. 1-5 stars). However, to optimize for quicker calcuations and a simplier interface, recommendation Raccoon instead uses the Jaccard Coefficient which is useful for measuring binary rating data (i.e. like/dislike). Many top companies have gone this route such as Youtube because users were primary rating things 4-5 or 1. The choice to use the Jaccard's instead of Pearson's was largely inspired by David Celis who designed Recommendable, the top recommendation engine on Rails. The Jaccard Coefficient also pairs very well with Redis which is able to union/diff sets of like/dislikes at O(N).

### K-Nearest Neighbors Algorithm for Recommendations

To deal with large use bases, it's essential to make optimizations that don't involve comparing every user against every other user. One way to deal with this is using the K-Nearest Neighbors algorithm which allows you to only compare a user against their 'nearest' neighbors. After a user's similarity is calculated with the Jaccard Coefficient, a sorted set is created which represents how similar that user is to every other. The top users from that list are considered their nearest neighbors. recommendation Raccoon uses a default value of 5, but this can easily be changed based on your needs.

### Wilson Score Confidence Interval for a Bernoulli Parameter

If you've ever been to Amazon or another site with tons of reviews, you've probably ran into a sorted page of top ratings only to find some of the top items have only one review. The Wilson Score Interval at 95% calculates the chance that the 'real' fraction of positive ratings is at least x. This allows for you to leave off the items/products that have not been rated enough or have an abnormally high ratio.

## Coming soon (now)

* Helper functions to pull in user data
* Change of data structure to an array of objects
* Implementation of Redis
* Helper functions to add new reviews

## Links

* Code: 'git clone git://github.com/guymorita/recommendationRaccoon.git'

## Redis Benchmarks

When combined with hiredis, redis can get/set at ~40,000 operations/second using 50 concurrent connections without pipelining.