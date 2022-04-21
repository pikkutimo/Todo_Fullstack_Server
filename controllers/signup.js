// const bcrypt = require('bcrypt')
const signupRouter = require('express').Router()
const User = require('../models/user')
const userTools = require('../utils/userTools')

signupRouter.post('/', async ( req, res, next ) => {
  const { username, name, password, email } = req.body

  try {
    let existingUser = await User.findOne({ '$or': [{ email: email }, { username: username }] })
    if (existingUser) {
      console.log('existing user')
      throw new Error()
    }

    const passwordHash = await userTools.hashPassword(password)

    const user = new User({
      username,
      name,
      email,
      passwordHash
    })

    const savedUser = await user.save()

    res.status(201).json(savedUser)
  } catch (error) {
    error.name = 'UserError'
    next(error)
  }
})

module.exports = signupRouter