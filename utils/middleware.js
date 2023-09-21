const logger = require('./logger')
const jwt = require('jsonwebtoken')
const { redisClient } = require('../controllers/redis')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  //console.log(error);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: error.message })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  //console.log(request)
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('bearer ')) {
    request.token = authorization.replace('bearer ', '')
  }
  next()
}

const userExtractor = (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    response.status(401).json({ error: 'token invalid' })
  } else {
    request.user = decodedToken.id
  }
  next()
}

const cacheData = async (request, response, next) => {
  if (!request.query.recipe || request.query.recipe === undefined) {
    return response.status(400).end()
  }
  const recipe = request.query.recipe
  console.log(recipe)
  const page = Number(request.query.page) * 10
  const cacheResults = await redisClient.get(`${recipe}?offset=${page}`)
  if (cacheResults) {
    const results = JSON.parse(cacheResults)
    console.log('Cache hit')
    return response.send(results)
  }
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  cacheData,
}
