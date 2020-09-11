
class Config {
  constructor(args) {
    this.nearestNeighbors = 5;
    this.className = 'movie';
    this.numOfRecsStore = 30;
    this.factorLeastSimilarLeastLiked = false;
    this.redisUrl = process.env.RACCOON_REDIS_URL || '127.0.0.1';
    this.redisPort = process.env.RACCOON_REDIS_PORT || 6379;
    this.redisAuth = process.env.RACCOON_REDIS_AUTH || '';
    this.redisUseSsl = process.env.RACCOON_REDIS_ENABLE_SSL || false;
  }
}

module.exports = exports = new Config();
