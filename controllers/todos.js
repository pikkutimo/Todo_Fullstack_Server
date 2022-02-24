const todoRouter = require('express').Router()
const Todo = require('../models/todo')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

todoRouter.get('/', async (req, res) => {
  const todos = await Todo
    .find({}).populate('user', { username: 1, name: 1 })
  res.json(todos)
})

todoRouter.get('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)

    if (todo) {
      res.json(todo)
    } else {
      res.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }
})

todoRouter.delete('/:id', async (req, res, next) => {
  try {
    await Todo.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

const getTokenFrom = req => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

todoRouter.post('/', async (req, res) => {
  const { content, important, done } = req.body

  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if(!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  const todo = new Todo({
    content: content,
    date: new Date(),
    important: important || false,
    done: done || false,
    user: user._id
  })

  const savedTodo = await todo.save()
  user.todos = user.todos.concat(savedTodo._id)
  await user.save()

  res.status(201).json(savedTodo)
})

todoRouter.put('/:id', (req, res, next) => {
  const { content, important, done } = req.body

  Todo.findByIdAndUpdate(
    req.params.id,
    { content, important, done },
    { new:true, runValidators: true, context: 'query' }
  )
    .then(updateTodo => {
      res.json(updateTodo)
    })
    .catch(error => next(error))
})

module.exports = todoRouter