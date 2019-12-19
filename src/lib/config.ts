class Config {
  nearestNeighbors: number
  className: string
  numOfRecsStore: number
  factorLeastSimilarLeastLiked: boolean
  redisUrl: string
  redisPort: number
  redisAuth: string
  constructor() {
    this.nearestNeighbors = 5
    this.className = 'movie'
    this.numOfRecsStore = 30
    this.factorLeastSimilarLeastLiked = false
    this.redisUrl = process.env.RACCOON_REDIS_URL || '127.0.0.1'
    this.redisPort = process.env.RACCOON_REDIS_PORT
      ? parseInt(process.env.RACCOON_REDIS_PORT)
      : 6379
    this.redisAuth = process.env.RACCOON_REDIS_AUTH || ''
  }
}

const config = new Config()

export default config
