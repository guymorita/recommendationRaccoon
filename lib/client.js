const redis = require('redis'),
  config = require('./config'),
  bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);

let client;
if (config.redisUseSsl) {
  client = redis.createClient(config.redisPort, config.redisUrl, {
    socket_keepalive: true,
    connect_timeout: 10000,
    retry_max_delay: 200,
    max_attempts: 5,
    auth_pass: config.redisAuth,
    tls: {servername: config.redisUrl},
  });
} else {
  client = redis.createClient(config.redisPort, config.redisUrl, {
    socket_keepalive: true,
    connect_timeout: 10000,
    retry_max_delay: 200,
    max_attempts: 5,
    auth_pass: config.redisAuth,
  });
}

module.exports = exports = client;
