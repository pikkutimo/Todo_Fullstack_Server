const jwt = require('jsonwebtoken')
const config = require('./config')

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

module.exports = createToken