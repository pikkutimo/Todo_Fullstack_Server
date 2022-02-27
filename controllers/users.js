const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Todo = require('../models/todo')

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return res.status(400).json({
      error: 'username must be unique'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

usersRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('todos', { content: 1, date: 1 })

  res.json(users)
})

usersRouter.get('/:id', async (req, res, next) => {

  const userId = req.params.id

  const todos = await Todo.find({ user: userId })

  res.json(todos)
})


module.exports = usersRouter