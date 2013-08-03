var raccoon = require('../raccoon.js').raccoon('mongodb://localhost/users');
var redis = require("redis"),
    client = redis.createClient();

describe('basic adds', function(){

  it('should validate a user has been added after a rating', function(){
    raccoon.input.liked('chris', 'batman', function(){
      client.smembers('movie:chris:liked', function(err, results){
        expect(results[0]).toEqual('batman');
      });
    });
  });
});
