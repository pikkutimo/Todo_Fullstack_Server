const todoRouter = require('express').Router()
const todo = require('../models/todo')
const Todo = require('../models/todo')

todoRouter.get('/', (req, res) => {
  Todo.find({})
    .then(todos => {
      res.json(todos)
    })
})

todoRouter.get('/:id', (req, res, next) => {
  Todo.findById(req.params.id)
    .then(todo => {
      if (todo) {
        res.json(todo)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

todoRouter.delete('/:id', function(req, res, next) {
  Todo.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch( error => next(error))
})

todoRouter.post('/', function (req, res, next) {
  const body = req.body

  const todo = new Todo ({
    content: body.content,
    date: new Date(),
    important: body.important || false,
    done: false,
  })

  todo.save()
    .then(savedTodo => {
      res.json(savedTodo)
    })
    .catch(error => next(error))
})

todoRouter.put('/:id', (req, res, next) => {
  const { content, important } = req.body

  Todo.findByIdAndUpdate(
    req.params.id,
    { content, important },
    { new:true, runValidators: true, context: 'query' }
  )
    .then(updateTodo => {
      res.json(updateTodo)
    })
    .catch(error => next(error))
})

module.exports = todoRouter