// const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')
// const config = require('../utils/config')
const userTools = require('../utils/userTools')

loginRouter.post('/', async (req, res, next) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ username })
    const passwordCorrect = user === null
      ? null
      : await bcrypt.compare(password, user.passwordHash)

    if (!passwordCorrect) {
      throw new Error
    }
    const token = userTools.createToken(user.username, user._id)
    let refreshToken = await RefreshToken.createToken(user._id)

    res
      .status(200)
      .send({ token, refreshToken, username: user.username, name: user.name, id: user._id, email: user.email })
  } catch (error) {
    error.name = 'LoginError'
    next(error)
  }

})

module.exports = loginRouter