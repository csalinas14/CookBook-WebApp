const config = require('../utils/config')
const logger = require('../utils/logger')
const { createClient } = require('redis')
const redisClient = createClient(config.REDIS_PORT)

redisClient
  .connect()
  .then(() => {
    logger.info('connected to Redis')
  })
  .catch((error) => {
    logger.error('error connecting to Redis:', error.message)
  })

module.exports = {
  redisClient,
}
