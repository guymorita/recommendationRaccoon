
const redis = require('redis'),
  config = require('./config'),
  bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);

/*
client = redis.createClient(config.redisPort, config.redisUrl);
if (config.redisAuth){
  client.auth(config.redisAuth, function (err) {
   if (err) { throw err; }
  });
}
*/

var client = redis.createClient(config.redisPort, config.redisUrl,
    {auth_pass: config.redisAuth, tls: {servername: config.redisUrl}});

module.exports = exports = client;
