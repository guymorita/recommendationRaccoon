import Redis from 'ioredis'
import config from './config'

const client = new Redis(config.redisPort, config.redisUrl)
if (config.redisAuth) {
  client.auth(config.redisAuth, function(err) {
    if (err) {
      throw err
    }
  })
}

export default client
