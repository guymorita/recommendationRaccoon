import config from './config'

const USER = 'user'
const ITEM = 'item'

export class Key {
  key: string
  keyArr: string[]
  constructor() {
    this.key = ''
    this.keyArr = []
  }

  joinKey() {
    this.key = [config.className].concat(this.keyArr).join(':')
    return this.key
  }

  userLikedSet(userId: string) {
    this.keyArr = [USER, userId, 'liked']
    return this.joinKey()
  }

  userDislikedSet(userId: string) {
    this.keyArr = [USER, userId, 'disliked']
    return this.joinKey()
  }

  itemLikedBySet(itemId: string) {
    this.keyArr = [ITEM, itemId, 'liked']
    return this.joinKey()
  }

  itemDislikedBySet(itemId: string) {
    this.keyArr = [ITEM, itemId, 'disliked']
    return this.joinKey()
  }

  mostLiked() {
    this.keyArr = ['mostLiked']
    return this.joinKey()
  }

  mostDisliked() {
    this.keyArr = ['mostDisliked']
    return this.joinKey()
  }

  recommendedZSet(userId: string) {
    this.keyArr = [USER, userId, 'recommendedZSet']
    return this.joinKey()
  }

  scoreboardZSet() {
    this.keyArr = ['scoreboard']
    return this.joinKey()
  }

  similarityZSet(userId: string) {
    this.keyArr = [USER, userId, 'similarityZSet']
    return this.joinKey()
  }

  tempAllLikedSet(userId: string) {
    this.keyArr = [USER, userId, 'tempAllLikedSet']
    return this.joinKey()
  }
}

const key = new Key()
export default key
