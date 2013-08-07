var redis = require("redis");

module.exports = function() {
  client = redis.createClient();
  // client = redis.createClient(6379,'127.0.0.1');
  // client = redis.createClient(12000, process.env.REDIS_HOST);
  // client.auth(process.env.REDIS_AUTH, function (err) {
  //  if (err) { throw err; }
  //  // You are now connected to your redis.
  // });
// client = redis.createClient(6379,'nodejitsudb6625264643.redis.irstack.com');
  // client.auth("nodejitsudb6625264643.redis.irstack.com:f327cfe980c971946e80b8e975fbebb4", function(err, reply) {
  //   if (err) {  console.log("Error: "+err); }
  //   else { console.log("should be connected. Reply: "+reply); }
  // });
  client.flushdb();
  // client.on('ready', function(){

  // });
};
