
const config = require('./config.js');

const CLASSNAME = config.className;
const USER = 'user';

class Key {
  constructor() {
    this.key = '';
    this.keyArr = [];
  }

  joinKey() {
    this.key = this.keyArr.join(':');
  }

  similaritySet(userId) {
    this.keyArr = [CLASSNAME, USER, userId, 'similaritySet'];
    this.joinKey();
    return this.key;
  }

  recommendedSet(userId) {
    this.keyArr = [CLASSNAME, USER, userId, 'recommendedSet'];
    this.joinKey();
    return this.key;
  }
}

module.exports = exports = new Key();
