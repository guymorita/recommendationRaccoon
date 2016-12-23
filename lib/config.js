
class Config {
  constructor(args) {
    this.nearestNeighbors = 5;
    this.className = 'movie';
    this.numOfRecsStore = 30;
    this.factorLeastSimilarLeastLiked = false;
    this.redisUrl = '127.0.0.1';
    this.redisPort = 6379;
    this.redisAuth = '';
  }
}

module.exports = exports = new Config();
