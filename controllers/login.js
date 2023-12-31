const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })

  //console.log(user);

  const passwordCorrect =
    user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'Invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  //console.log(userForToken);

  const token = jwt.sign(userForToken, process.env.SECRET)
  //console.log(token);
  await user.populate('recipes')
  response.status(200).send({
    token,
    username: user.username,
    name: user.name,
    recipes: user.recipes,
  })
})

module.exports = loginRouter
