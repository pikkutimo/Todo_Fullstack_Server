const jwt = require('jsonwebtoken')
const config = require('./config')
const bcrypt = require('bcrypt')

const createToken = (username, id) => {

  const user = {
    username: username,
    id: id,
  }
  const token = jwt.sign(
    user,
    `${process.env.SECRET}`,
    { expiresIn: config.TOKEN_LENGTH }
  )

  return token
}

const hashPassword = async (password) => {
  const saltRounds = config.SALT_ROUNDS
  const passwordHash = await bcrypt.hash(password, saltRounds)

  return passwordHash
}

module.exports = { createToken, hashPassword }