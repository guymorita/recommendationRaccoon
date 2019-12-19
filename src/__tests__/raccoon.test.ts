/* eslint-env jest */

import client from '../lib/client'

// var blanket = require("blanket")({
//     // options are passed as an argument object to the require statement
//    "pattern": "../lib/"
//  });

// const config = require('../dist/lib/config.js'),
// const raccoon = require('../dist/lib/raccoon.js');
import * as raccoon from '../lib/raccoon'

describe('basic likes, dislikes, unlikes, and undislikes', function() {
  beforeEach(async () => {
    await client.flushdb()
    await raccoon.liked('chris', 'batman')
    await raccoon.liked('larry', 'batman')
    await raccoon.disliked('greg', 'batman')
    await raccoon.liked('mai', 'superman')
    await raccoon.unliked('mai', 'superman')
    await raccoon.disliked('jesse', 'superman')
    await raccoon.undisliked('jesse', 'superman')
  })
  describe('basic like', function() {
    it('should validate a user has been added after a rating', async () => {
      const results = await client.smembers('movie:user:chris:liked')
      expect(results[0]).toBe('batman')
    })
  })
  describe('basic dislike', function() {
    it('should validate a user has been added after a rating', async () => {
      const results = await client.smembers('movie:user:greg:disliked')
      expect(results[0]).toBe('batman')
    })
  })
  describe('basic unlike', function() {
    it('should validate a user has been removed after an unlike', async () => {
      const results = await client.smembers('movie:user:mai:liked')
      expect(results[0]).toBe(undefined)
    })
  })
  describe('basic undislike', function() {
    it('should validate a user has been removed after an undislike', async () => {
      const results = client.smembers('movie:user:jesse:disliked')
      expect(results[0]).toBe(undefined)
    })
  })
})

describe('callbacks', function() {
  it('should fire the input callback after a like is added', async () => {
    await raccoon.liked('hao', 'superman')
  })
  it('should fire the input callback after a disliked is added', async () => {
    await raccoon.liked('hao', 'superman')
  })
})

describe('accurate recommendations', function() {
  beforeAll(async () => {
    await client.flushdb()

    await raccoon.liked('ChristianB', 'Typical')
    await raccoon.liked('ChristianB', 'Value7')
    await raccoon.liked('malbery', 'Typical')
    await raccoon.liked('malbery', 'Value1')
    await raccoon.liked('malbery', 'Value2')
    await raccoon.liked('malbery', 'Value3')
    await raccoon.liked('malbery', 'Value4')
    await raccoon.liked('malbery', 'Value5')
    await raccoon.liked('malbery', 'Value6')
    await raccoon.liked('malbery', 'Value7')
  })
  it('should not have recommendations for malbery', async () => {
    const recs = await raccoon.recommendFor('malbery', 5)
    expect(recs[0]).toBe(undefined)
  })
})

describe('recommendations', function() {
  beforeAll(async () => {
    await client.flushdb()
    await raccoon.liked('chris', 'batman')
    await raccoon.liked('chris', 'superman')
    await raccoon.disliked('chris', 'chipmunks')
    await raccoon.liked('max', 'batman')
    await raccoon.disliked('max', 'chipmunks')
    await raccoon.liked('greg', 'batman')
    await raccoon.liked('greg', 'superman')
    await raccoon.liked('larry', 'batman')
    await raccoon.liked('larry', 'iceage')
    await raccoon.disliked('tuhin', 'batman')
    await raccoon.disliked('tuhin', 'superman')
    await raccoon.disliked('tuhin', 'chipmunks')
    await raccoon.disliked('kristina', 'batman')
    await raccoon.disliked('kristina', 'superman')
    await raccoon.disliked('andre', 'superman')
    await raccoon.disliked('andre', 'chipmunks')
    await raccoon.disliked('guy', 'superman', { updateRecs: false })
  })
  it('should recommend a movie if a similar user liked it', async () => {
    const recs = await raccoon.recommendFor('andre', 5)
    expect(recs[0]).toBe('batman')
  })
  it('should not recommend a movie if updateRecs was false', async () => {
    const recs = await raccoon.recommendFor('guy', 5)
    expect(recs[0]).toBe(undefined)
  })
  // it('should not recommend a movie that people opposite liked', async () => {
  //   raccoon.recommendFor('andre', 5, function(recs){
  //     assert.notEqualequal(recs[0], 'chipmunks');
  //     done();
  //   });
  // });
})

describe('stats1', function() {
  beforeAll(async () => {
    await client.flushdb()
    await raccoon.liked('chris', 'batman')
    await raccoon.liked('chris', 'superman')
    await raccoon.disliked('chris', 'chipmunks')
    await raccoon.liked('max', 'batman')
    await raccoon.disliked('max', 'chipmunks')
    await raccoon.liked('greg', 'batman')
    await raccoon.liked('greg', 'superman')
    await raccoon.liked('larry', 'batman')
    await raccoon.liked('larry', 'iceage')
    await raccoon.disliked('tuhin', 'batman')
    await raccoon.disliked('tuhin', 'superman')
    await raccoon.disliked('tuhin', 'chipmunks')

    const promises: Promise<void>[] = []
    for (var i = 0; i < 25; i++) {
      const p = raccoon.liked('user' + i, 'batman')
      promises.push(p)
    }
    await Promise.all(promises)
  })
  it('should have batman as the bestRated even though iceage has only likes', async () => {
    const bestRated = await raccoon.bestRated()
    expect(bestRated[0]).toBe('batman')
  })
  it('should have chipmunks as the worst rated', async () => {
    const worstRated = await raccoon.worstRated()
    expect(worstRated[0]).toBe('chipmunks')
  })
  it('should have batman as the most liked and superman as second', async () => {
    const mostLiked = await raccoon.mostLiked()
    expect(mostLiked[0]).toBe('batman')
    expect(mostLiked[1]).toBe('superman')
  })
  it('should have chipmunks as the most disliked', async () => {
    const mostDisliked = await raccoon.mostDisliked()
    expect(mostDisliked[0]).toBe('chipmunks')
  })
  it('should have an accurate list of users who liked an item', async () => {
    const listOfUsers = await raccoon.likedBy('superman')
    expect(listOfUsers).toContain('chris')
    expect(listOfUsers).toContain('greg')
  })
  it('should have an accurate number of users who liked an item', async () => {
    const numUsers = await raccoon.likedCount('batman')
    expect(numUsers).toBe(29)
  })
  it('should have an accurate list of users who disliked an item', async () => {
    const listOfUsers = await raccoon.dislikedBy('chipmunks')
    expect(listOfUsers).toContain('chris')
    expect(listOfUsers).toContain('max')
    expect(listOfUsers).toContain('tuhin')
  })
  it('should have an accurate number of users who disliked an item', async () => {
    const numUsers = await raccoon.dislikedCount('superman')
    expect(numUsers).toBe(1)
  })
  it('should list all a users likes', async () => {
    const itemList = await raccoon.allLikedFor('greg')
    expect(itemList).toContain('batman')
  })
  it('should list all a users dislikes', async () => {
    raccoon.allDislikedFor('tuhin').then(itemList => {
      expect(itemList).toContain('batman')
      expect(itemList).toContain('superman')
      expect(itemList).toContain('chipmunks')
    })
  })
  it('should list all a users rated items', async () => {
    const itemList = await raccoon.allWatchedFor('max')

    expect(itemList).toContain('batman')
    expect(itemList).toContain('chipmunks')
  })
  it('should not have similar users before updating', async () => {
    const similarUsers = await raccoon.mostSimilarUsers('chris')
    expect(similarUsers[0]).toBe(undefined)
  })
  it('should not have dissimilar users before updating', async () => {
    const leastSimilarUsers = await raccoon.leastSimilarUsers('chris')
    expect(leastSimilarUsers[0]).toBe(undefined)
  })
})

// describe('db connections', function(){
//   it('should connect to a remove db successfully', async () => {
//     client.flushdb();
//     client.end();
//     client.quit();
//     config.localSetup = false;
//     config.remoteRedisPort = 6379;
//     config.remoteRedisURL = '127.0.0.1';
//     config.remoteRedisAuth = 1111;
//     raccoon.liked('chris', 'batman', function(){
//       raccoon.allLikedFor('chris', function(itemList){
//         expect(itemList).toContain('batman');
//         client.flushdb();
//         client.end();
//         config.localSetup = true;
//         done();
//       });
//     });
//   });
// });
