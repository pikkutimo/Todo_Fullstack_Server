const todoRouter = require('express').Router()
const Todo = require('../models/todo')
const User = require('../models/user')

todoRouter.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.find({ user: req.payload })
    res.json(todos)
  } catch (exception) {
    next(exception)
  }
})

todoRouter.get('/:id', async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id)

    if (todo && todo.user.toString() === req.payload) {
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
  }catch (exception) {
    next(exception)
  }
})

todoRouter.post('/', async (req, res, next) => {
  const { content, important, done } = req.body

  try {
    const user = await User.findById(req.payload)

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

    res.status(201).json(savedTodo).end()
  } catch (error) {
    next(error)
  }
})

todoRouter.put('/:id', async (req, res, next) => {
  const { content, important, done } = req.body

  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { content, important, done },
      { new:true, runValidators: true, context: 'query' }
    )

    res.status(200).json(todo)
  } catch (error) {
    next(error)
  }

})

module.exports = todoRouter