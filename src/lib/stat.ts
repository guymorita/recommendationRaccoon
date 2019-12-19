import client from './client'
import Key from './key'

export const recommendFor = function(userId: string, numberOfRecs: number) {
  return client.zrevrange(Key.recommendedZSet(userId), 0, numberOfRecs)
}
export const bestRated = function() {
  return client.zrevrange(Key.scoreboardZSet(), 0, -1)
}
export const worstRated = function() {
  return client.zrange(Key.scoreboardZSet(), 0, -1)
}
export const bestRatedWithScores = function(numOfRatings: number) {
  return client.zrevrange(Key.scoreboardZSet(), 0, numOfRatings, 'WITHSCORES')
}
export const mostLiked = function() {
  return client.zrevrange(Key.mostLiked(), 0, -1)
}
export const mostDisliked = function() {
  return client.zrevrange(Key.mostDisliked(), 0, -1)
}
export const usersWhoLikedAlsoLiked = function(itemId: string) {
  console.log(itemId)
  throw new Error('not yet implement')
}
export const mostSimilarUsers = function(userId: string) {
  return client.zrevrange(Key.similarityZSet(userId), 0, -1)
}
export const leastSimilarUsers = function(userId: string) {
  return client.zrange(Key.similarityZSet(userId), 0, -1)
}
export const likedBy = function(itemId: string) {
  return client.smembers(Key.itemLikedBySet(itemId))
}
export const likedCount = function(itemId: string) {
  return client.scard(Key.itemLikedBySet(itemId))
}
export const dislikedBy = function(itemId: string) {
  return client.smembers(Key.itemDislikedBySet(itemId))
}
export const dislikedCount = function(itemId: string) {
  return client.scard(Key.itemDislikedBySet(itemId))
}
export const allLikedFor = function(userId: string) {
  return client.smembers(Key.userLikedSet(userId))
}
export const allDislikedFor = function(userId: string) {
  return client.smembers(Key.userDislikedSet(userId))
}
export const allWatchedFor = function(userId: string) {
  return client.sunion(Key.userLikedSet(userId), Key.userDislikedSet(userId))
}
