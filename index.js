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

const errorHandler = (error, req, res, next) => {
    console.log(error)

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformed id' })
    }

    next(error)
}

app.use(errorHandler)

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

app.delete('/api/todos/:id', function(req, res) {
  const { id } = req.params;
  todos = todos.filter(todo => todo.id !== id)

  res.status(204).end()
})

app.post('/api/todos', function (req, res) {
    const body = req.body
    
    if (body.content === undefined) {
        return res.status(400).json({ 
          error: 'content missing' 
        })
    }

    const todo = new Todo ({
        content: body.content,
        date: new Date(),
        important: body.important || false,
    })
    
    todo.save()
        .then(savedTodo => {
            res.json(savedTodo)
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
    
app.use(unknownEndpoint)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))