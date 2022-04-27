const usersRouter = require('express').Router()
const User = require('../models/user')
const userTools = require('../utils/userTools')

usersRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('todos', { content: 1, date: 1 })

  res.json(users)
})

usersRouter.put('/:id', async (req, res, next) => {
  const { username, name, password, email } = req.body

  // Create an object from defined fields of the request body

  const update = new Object()

  if (password) {
    const passwordHash =  await userTools.hashPassword(password)
    update.passwordHash = passwordHash
  }

  username !== undefined ? update.username = req.body.username : console.log('username not defined')
  name !== undefined ? update.name = req.body.name : console.log('name not defined')
  email !== undefined ? update.email = req.body.email : console.log('email not defined')

  try {
    await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )

  } catch (error) {
    next(error)
  }

})

module.exports = usersRouter