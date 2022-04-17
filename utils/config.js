require('dotenv').config()

const PORT = process.env.PORT

const MONGODB_URI = process.env.NODE_ENV === 'test'
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI


const RTOKEN_LENGTH = 86400
const TOKEN_LENGTH = 3600

module.exports = {
  MONGODB_URI,
  PORT,
  TOKEN_LENGTH,
  RTOKEN_LENGTH
}