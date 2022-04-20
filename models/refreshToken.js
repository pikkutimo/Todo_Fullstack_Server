const mongoose = require('mongoose')
const config = require('../utils/config')
// const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const refreshTokenSchema = new mongoose.Schema({
  refreshToken: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expirationDate: Date,
})

refreshTokenSchema.statics.createToken = async (id) => {
  let expiredAt = new Date()
  expiredAt.setSeconds(
    expiredAt.getSeconds() + config.RTOKEN_LENGTH
  )

  let _token = uuidv4()

  let _object = new RefreshToken({
    refreshToken: _token,
    user: id,
    expirationDate: expiredAt.getTime(),
  })

  let token = await _object.save()
  return token.refreshToken
}

refreshTokenSchema.statics.verifyExpiration = ( token ) => {
  return token.expirationDate.getTime() < new Date().getTime()
}

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)

module.exports = RefreshToken