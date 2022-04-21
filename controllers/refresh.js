const RefreshToken = require('../models/refreshToken')
const refreshRouter = require('express').Router()
const userTools = require('../utils/userTools')

refreshRouter.post('/', async (req, res, next) => {
  const { requestToken, username, } = req.body

  try {
    let refreshToken = await RefreshToken.findOne({ refreshToken: requestToken })

    // for expired token throw exception
    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec()
      throw new Error()
    }

    const newAccessToken = userTools.createToken(username, refreshToken.user)

    res.status(200).json({
      token: newAccessToken,
      refreshToken: refreshToken
    })

  } catch (error) {
    error.type = 'Refreshtoken expired'
    next(error)
  }
})


module.exports = refreshRouter