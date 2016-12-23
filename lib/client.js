
const redis = require('redis'),
  config = require('./config');

client = redis.createClient(config.redisPort, config.redisUrl);
if (config.redisAuth){
  this.redisCli.auth(config.redisAuth, function (err) {
   if (err) { throw err; }
  });
}

module.exports = exports = client;
