
import client from './client'
import Key from './key'

const stat = {
  recommendFor: function(userId: string, numberOfRecs: number){
    return client.zrevrange(Key.recommendedZSet(userId), 0, numberOfRecs)
  },
  bestRated: function(){
    return client.zrevrange(Key.scoreboardZSet(), 0, -1)
  },
  worstRated: function(){
    return client.zrange(Key.scoreboardZSet(), 0, -1)
  },
  bestRatedWithScores: function(numOfRatings: number){
    return client.zrevrange(Key.scoreboardZSet(), 0, numOfRatings, 'WITHSCORES')
  },
  mostLiked: function(){
    return client.zrevrange(Key.mostLiked(), 0, -1)
  },
  mostDisliked: function(){
    return client.zrevrange(Key.mostDisliked(), 0, -1)
  },
  usersWhoLikedAlsoLiked: function(itemId: string){
  },
  mostSimilarUsers: function(userId: string){
    return client.zrevrange(Key.similarityZSet(userId), 0, -1)
  },
  leastSimilarUsers: function(userId: string){
    return client.zrange(Key.similarityZSet(userId), 0, -1)
  },
  likedBy: function(itemId: string){
    return client.smembers(Key.itemLikedBySet(itemId))
  },
  likedCount: function(itemId: string){
    return client.scard(Key.itemLikedBySet(itemId))
  },
  dislikedBy: function(itemId: string){
    return client.smembers(Key.itemDislikedBySet(itemId))
  },
  dislikedCount: function(itemId: string){
    return client.scard(Key.itemDislikedBySet(itemId))
  },
  allLikedFor: function(userId: string){
    return client.smembers(Key.userLikedSet(userId))
  },
  allDislikedFor: function(userId: string){
    return client.smembers(Key.userDislikedSet(userId))
  },
  allWatchedFor: function(userId: string){
    return client.sunion(Key.userLikedSet(userId), Key.userDislikedSet(userId))
  }
};

export default stat
