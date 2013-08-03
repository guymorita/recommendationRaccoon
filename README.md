# recommend Raccoon

A collaborative filtering based recommendation engine and NPM module built on top of Node.js and Redis. The engine uses the Jaccard coefficient to determine the similarity between users and k-nearest-neighbors to create recommendations. This module is useful for any with a database of users, a database of products/movies/items and the desire to give their users the ability to like/dislike and receive recommendations.

Also I'm debating switching it to use the Neo4j graph database to take advantage of the traversal abilities, breadthe/depth in finding recommendations and time complexity.

## Requirements

* Node.js 0.10.x
* Redis
* Async
* Underscore

## Installation

``` bash
npm install racooon
```


## Coming soon (now)

* Helper functions to pull in user data
* Change of data structure to an array of objects
* Implementation of Redis
* Helper functions to add new reviews

After installing Raccoon you should configure it.

## Links

* Code: 'git clone git://github.com/guymorita/raccoon.git'