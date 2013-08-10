var redis = require("redis"),
    config = require('./config.js').config();


module.exports = function() {
  if (config.localSetup ===  true){
    client = redis.createClient(config.localRedisPort,config.localRedisURL);
  } else {
    client = redis.createClient(config.remoteRedisPort, config.remoteRedisURL);
    client.auth(config.remoteRedisAuth, function (err) {
     if (err) { throw err; }
     // You are now connected to your redis.
    });
  }
  if (config.flushDBsOnStart){
    client.flushdb();
  }
  client.on('ready', function(){
  });
};
