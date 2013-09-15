(function() {
  var config = {
    nearestNeighbors: 5,
    className: 'movie',
    numOfRecsStore: 30,
    sampleContent: true,
    factorLeastSimilarLeastLiked: false,
    localMongoDbURL: 'mongodb://localhost/users',
    remoteMongoDbURL: process.env.MONGO_HOSTAUTH,
    localRedisPort: 6379,
    localRedisURL: '127.0.0.1',
    remoteRedisPort: process.env.REDIS_PORT || 12000,
    remoteRedisURL: process.env.REDIS_HOST,
    remoteRedisAuth: process.env.REDIS_AUTH,
    flushDBsOnStart: true,
    localSetup: true
  };

  module.exports = config;
}).call(this);
