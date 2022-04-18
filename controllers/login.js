const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const RefreshToken = require('../models/refreshToken')
const config = require('../utils/config')

loginRouter.post('/', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? null
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(
    userForToken,
    `${process.env.SECRET}`,
    { expiresIn: config.TOKEN_LENGTH }
  )

  let refreshToken = await RefreshToken.createToken(userForToken)
  // console.log(refreshToken)
  res
    .status(200)
    .send({ token, refreshToken, username: user.username, name: user.name })
})

module.exports = loginRouter