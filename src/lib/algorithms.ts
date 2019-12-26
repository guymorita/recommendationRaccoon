import config from './config'
import _ from 'lodash'
import Key from './key'
import client from './client'

import pMap from 'p-map'

// the jaccard coefficient outputs an objective measurement of the similarity between two objects. in this case, two users. the coefficient
// is the result of summing the two users likes/dislikes incommon then summing they're likes/dislikes that they disagree on. this sum is
// then divided by the number of items they both reviewed.
const jaccardCoefficient = async function(userId1: string, userId2: string) {
  // finalJaccard = 0,

  const user1LikedSet = Key.userLikedSet(userId1)
  const user1DislikedSet = Key.userDislikedSet(userId1)
  const user2LikedSet = Key.userLikedSet(userId2)
  const user2DislikedSet = Key.userDislikedSet(userId2)

  // retrieving a set of the users likes incommon
  const results1 = await client.sinter(user1LikedSet, user2LikedSet)
  const results2 = await client.sinter(user1DislikedSet, user2DislikedSet)
  const results3 = await client.sinter(user1LikedSet, user2DislikedSet)
  const results4 = await client.sinter(user1DislikedSet, user2LikedSet)

  const similarity =
    results1.length + results2.length - results3.length - results4.length
  // calculating the number of movies rated incommon
  const ratedInCommon =
    results1.length + results2.length + results3.length + results4.length
  // calculating the the modified jaccard score. similarity / num of comparisons made incommon
  const finalJaccardScore: number = similarity / ratedInCommon
  // calling the callback function passed to jaccard with the new score
  return finalJaccardScore
}

// this function updates the similarity for one user versus all others. at scale this probably needs to be refactored to compare a user
// against clusters of users instead of against all. every comparison will be a value between -1 and 1 representing simliarity.
// -1 is exact opposite, 1 is exactly the same.
export const updateSimilarityFor = async function(userId: string) {
  // turning the userId into a string. depending on the db they might send an object, in which it won't compare properly when comparing
  // to other users
  // userId = String(userId)
  // initializing variables
  let itemLikeDislikeKeys: string[] = []
  // setting the redis key for the user's similarity set
  const similarityZSet = Key.similarityZSet(userId)
  // creating a combined set with the all of a users likes and dislikes
  const userRatedItemIds = await client.sunion(
    Key.userLikedSet(userId),
    Key.userDislikedSet(userId)
  )
  // if they have rated anything
  if (userRatedItemIds.length > 0) {
    // creating a list of redis keys to look up all of the likes and dislikes for a given set of items
    itemLikeDislikeKeys = _(userRatedItemIds)
      .map(function(itemId) {
        // key for that item being liked
        const itemLiked = Key.itemLikedBySet(itemId)
        // key for the item being disliked
        const itemDisliked = Key.itemDislikedBySet(itemId)
        // returning an array of those keys
        return [itemLiked, itemDisliked]
      })
      .flatten()
      .value()
  }
  // flattening the array of all the likes/dislikes for the items a user rated
  // itemLikeDislikeKeys = _.flatten(itemLikeDislikeKeys);
  // builds one set of all the users who liked and disliked the same items
  const otherUserIdsWhoRated = await client.sunion(...itemLikeDislikeKeys)

  await pMap(otherUserIdsWhoRated, async otherUserId => {
    // if there is only one other user or the other user is the same user
    if (otherUserIdsWhoRated.length === 1 || userId === otherUserId) {
      // then call the callback and exciting the similarity check
      return
    }
    // if the userid is not the same as the user
    if (userId !== otherUserId) {
      // calculate the jaccard coefficient for similarity. it will return a value between -1 and 1 showing the two users
      // similarity
      const result = await jaccardCoefficient(userId, otherUserId)
      await client.zadd(similarityZSet, result.toString(), otherUserId)
    }
  })
}

export const predictFor = async function(userId: string, itemId: string) {
  // userId = String(userId);
  // itemId = String(itemId);
  let finalSimilaritySum = 0.0
  const similarityZSet = Key.similarityZSet(userId)
  const likedBySet = Key.itemLikedBySet(itemId)
  const dislikedBySet = Key.itemDislikedBySet(itemId)

  const result1 = await similaritySum(similarityZSet, likedBySet)
  const result2 = await similaritySum(similarityZSet, dislikedBySet)
  finalSimilaritySum = result1 - result2
  const likedByCount = await client.scard(likedBySet)
  const dislikedByCount = await client.scard(dislikedBySet)

  const prediction = finalSimilaritySum / (likedByCount + dislikedByCount)
  if (isFinite(prediction)) {
    return prediction
  } else {
    return 0.0
  }
}

export const similaritySum = async function(simSet: string, compSet: string) {
  let similarSum = 0.0
  const userIds = await client.smembers(compSet)
  await pMap(
    userIds,
    async userId => {
      const zScore = await client.zscore(simSet, userId)
      const newScore = parseFloat(zScore) || 0.0
      similarSum += newScore
    },
    { concurrency: 1 }
  )

  return similarSum
}

// after the similarity is updated for the user, the users recommendations are updated
// recommendations consist of a sorted set in Redis. the values of this set are
// names of the items and the score is what raccoon estimates that user would rate it
// the values are generally not going to be -1 or 1 exactly because there isn't 100%
// certainty.
export const updateRecommendationsFor = async function(userId: string) {
  // turning the user input into a string so it can be compared properly
  // userId = String(userId);
  // creating two blank arrays
  const setsToUnion: string[] = []
  const scoreMap: [number, string][] = []
  // initializing the redis keys for temp sets, the similarity set and the recommended set
  const tempAllLikedSet = Key.tempAllLikedSet(userId)
  const similarityZSet = Key.similarityZSet(userId)
  const recommendedZSet = Key.recommendedZSet(userId)

  const mostSimilarUserIds = await client.zrevrange(
    similarityZSet,
    0,
    config.nearestNeighbors - 1
  )
  const leastSimilarUserIds = await client.zrange(
    similarityZSet,
    0,
    config.nearestNeighbors - 1
  )
  // iterate through the user ids to create the redis keys for all those users likes
  _.each(mostSimilarUserIds, function(usrId) {
    setsToUnion.push(Key.userLikedSet(usrId))
  })
  // if you want to factor in the least similar least likes, you change this in config
  // left it off because it was recommending items that every disliked universally
  _.each(leastSimilarUserIds, function(usrId) {
    setsToUnion.push(Key.userDislikedSet(usrId))
  })
  // if there is at least one set in the array, continue
  if (setsToUnion.length > 0) {
    // setsToUnion.unshift(tempAllLikedSet);
    // await client.sunionstore(setsToUnion) //TODO: check
    await client.sunionstore(tempAllLikedSet, ...setsToUnion)
    const notYetRatedItems = await client.sdiff(
      tempAllLikedSet,
      Key.userLikedSet(userId),
      Key.userDislikedSet(userId)
    )

    await pMap(
      notYetRatedItems,
      async function(itemId) {
        const score = await predictFor(userId, itemId)
        scoreMap.push([score, itemId])
      },
      { concurrency: 1 }
    )

    await client.del(recommendedZSet)

    await pMap(
      scoreMap,
      async function(scorePair) {
        await client.zadd(
          recommendedZSet,
          scorePair[0].toString(),
          scorePair[1]
        )
      },
      { concurrency: 1 }
    )

    await client.del(tempAllLikedSet)
    const length = await client.zcard(recommendedZSet)
    await client.zremrangebyrank(
      recommendedZSet,
      0,
      length - config.numOfRecsStore - 1
    )
  }
}

// the wilson score is a proxy for 'best rated'. it represents the best finding the best ratio of likes and also eliminating
// outliers. the wilson score is a value between 0 and 1.
export const updateWilsonScore = async function(itemId: string) {
  // creating the redis keys for scoreboard and to get the items liked and disliked sets
  const scoreboard = Key.scoreboardZSet()
  const likedBySet = Key.itemLikedBySet(itemId)
  const dislikedBySet = Key.itemDislikedBySet(itemId)
  // used for a confidence interval of 95%
  const z = 1.96
  // initializing variables to calculate wilson score
  let n, pOS, score

  const likedResults = await client.scard(likedBySet)
  const dislikedResults = await client.scard(dislikedBySet)

  if (likedResults + dislikedResults > 0) {
    // set n to the sum of the total ratings for the item
    n = likedResults + dislikedResults
    // set pOS to the num of liked results divided by the number rated
    // pOS represents the proportion of successes or likes in this case
    // pOS = likedResults / parseFloat(n);
    pOS = likedResults / n
    // try the following equation
    try {
      // calculating the wilson score
      // http://www.evanmiller.org/how-not-to-sort-by-average-rating.html
      score =
        (pOS +
          (z * z) / (2 * n) -
          z * Math.sqrt((pOS * (1 - pOS) + (z * z) / (4 * n)) / n)) /
        (1 + (z * z) / n)
    } catch (e) {
      // if an error occurs, set the score to 0.0 and console log the error message.
      console.log(e.name + ': ' + e.message)
      score = 0.0
    }
    // add that score to the overall scoreboard. if that item already exists, the score will be updated.
    await client.zadd(scoreboard, score.toString(), itemId)
  }
}
