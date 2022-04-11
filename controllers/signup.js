const bcrypt = require('bcrypt')
const signupRouter = require('express').Router()
const User = require('../models/user')

signupRouter.post('/', async ( req, res ) => {
  const { username, name, password, email } = req.body

  let existingUser = await User.findOne({ username })
  if (existingUser) {
    return res.status(409).json({ error : 'existing user' })
  }

  existingUser = await User.findOne({ email })
  if (existingUser) {
    return res.status(409).json({ error : 'existing email' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    email,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = signupRouter