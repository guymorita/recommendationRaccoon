import Key from './key'
import client from './client'
import * as algo from './algorithms'

export const updateSequence = async function(userId: string, itemId: string) {
  // let updateWilson = true;
  // if ('updateWilson' in options) {
  //   updateWilson = options.updateWilson ? true : false;
  // }

  await algo.updateSimilarityFor(userId)
  return Promise.all([
    algo.updateWilsonScore(itemId),
    algo.updateRecommendationsFor(userId)
  ])
}

const changeRating = async function(
  userId: string,
  itemId: string,
  options: any
) {
  let updateRecommendations = true
  if ('updateRecs' in options) {
    updateRecommendations = !!options.updateRecs
  }

  const removeRating = !!options.removeRating

  const feelingItemSet = options.liked
    ? Key.itemLikedBySet(itemId)
    : Key.itemDislikedBySet(itemId)
  const feelingUserSet = options.liked
    ? Key.userLikedSet(userId)
    : Key.userDislikedSet(userId)
  const mostFeelingSet = options.liked ? Key.mostLiked() : Key.mostDisliked()

  const result = await client.sismember(feelingItemSet, userId)

  if (result === 0 && !removeRating) {
    await client.zincrby(mostFeelingSet, 1, itemId)
  } else if (result > 0 && removeRating) {
    await client.zincrby(mostFeelingSet, -1, itemId)
  }

  removeRating
    ? await client.srem(feelingUserSet, itemId)
    : await client.sadd(feelingUserSet, itemId)
  removeRating
    ? await client.srem(feelingItemSet, userId)
    : await client.sadd(feelingItemSet, userId)

  const result2 = await client.sismember(feelingItemSet, userId)
  if (updateRecommendations && result2 > 0) {
    await updateSequence(userId, itemId)
  }
}

export const liked = function(
  userId: string,
  itemId: string,
  options: any = {}
) {
  options.liked = true
  return changeRating(userId, itemId, options)
}

export const disliked = function(
  userId: string,
  itemId: string,
  options: any = {}
) {
  options.liked = false
  return changeRating(userId, itemId, options)
}

export const unliked = function(
  userId: string,
  itemId: string,
  options: any = {}
) {
  options.liked = true
  options.removeRating = true
  return changeRating(userId, itemId, options)
}

export const undisliked = function(
  userId: string,
  itemId: string,
  options: any = {}
) {
  options.liked = false
  options.removeRating = true
  return changeRating(userId, itemId, options)
}
