require('dotenv').config()

const PORT = process.env.PORT || 3003
const REDIS_URL =
  process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : ''
const REDIS_PORT = process.env.REDIS_PORT || 6379
const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

const API_KEY = process.env.API_KEY

const API_BASEURL = 'https://api.spoonacular.com/recipes/'
const RECIPES_PER_PAGE = 8

module.exports = {
  MONGODB_URI,
  PORT,
  API_KEY,
  API_BASEURL,
  REDIS_URL,
  REDIS_PORT,
  RECIPES_PER_PAGE,
}
