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

  try {
    const passwordHash = await userTools.hashPassword(password)
    User.findByIdAndUpdate(
      req.params.id,
      {
        $set : {
          username: username,
          name: name,
          email: email,
          passwordHash: passwordHash
        }
      },
      (user) => {
        res.json(user)
      }
    )
  } catch (error) {
    next(error)
  }

})

module.exports = usersRouter