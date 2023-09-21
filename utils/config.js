require('dotenv').config()

const PORT = process.env.PORT
const REDIS_PORT = process.env.REDIS_PORT
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

const API_KEY = process.env.API_KEY

const API_BASEURL = 'https://api.spoonacular.com/recipes/'

module.exports = {
  MONGODB_URI,
  PORT,
  API_KEY,
  API_BASEURL,
  REDIS_PORT,
}
