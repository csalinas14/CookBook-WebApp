const config = require('../utils/config')
const logger = require('../utils/logger')
const { createClient } = require('redis')
const redisClient = createClient({
  url: config.REDIS_URL,
  port: config.REDIS_PORT,
})

redisClient
  .connect()
  .then(() => {
    logger.info('connected to Redis')
    logger.info(config.REDIS_URL)
  })
  .catch((error) => {
    logger.error('error connecting to Redis:', error.message)
  })

module.exports = {
  redisClient,
}
