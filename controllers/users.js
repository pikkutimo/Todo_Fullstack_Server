// const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Todo = require('../models/todo')

usersRouter.get('/', async (req, res) => {
  const users = await User
    .find({})
    .populate('todos', { content: 1, date: 1 })

  res.json(users)
})


module.exports = usersRouter