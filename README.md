# recommend Raccoon

A collaborative filtering based recommendation engine and NPM module built on top of Node.js and Mongoose (MongoDB). Currently using the Pearson product-moment correlation algorithm and I'll likely refactor it to use Python and/or Redis as Memcached. Also I'm debating switching it to use the Neo4j graph database to take advantage of the traversal abilities, breadthe/depth in finding recommendations and time complexity.

## Requirements

* Node.js 0.10.x
* MongoDB, Mongoose

## Installation

``` js
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