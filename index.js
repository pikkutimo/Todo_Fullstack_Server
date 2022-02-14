require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const PORT = process.env.PORT
const Todo = require('./models/todo')

morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(':method :url :status :response-time :body'))

app.get('/', (req, res) => {
  res.send('Todo app')
})

app.get('/api/todos', (req, res) => {
  Todo.find({})
    .then(todos => {
      res.json(todos)
    })
})

app.get('/api/todos/:id', (req, res, next) => {
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

var bodyParser = require('body-parser')
app.use(bodyParser.json())

app.delete('/api/todos/:id', function(req, res, next) {
  Todo.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch( error => next(error))
})

app.post('/api/todos', function (req, res, next) {
  const body = req.body

  const todo = new Todo ({
    content: body.content,
    date: new Date(),
    important: body.important || false,
  })

  todo.save()
    .then(savedTodo => {
      res.json(savedTodo)
    })
    .catch(error => next(error))
})

app.put('/api/todos/:id', (req, res, next) => {
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

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))