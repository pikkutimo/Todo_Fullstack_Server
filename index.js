const express = require('express')
const app = express()
const morgan = require('morgan')
const port = 3000

let todos = [
    {
        id: 1,
        content: 'Wash dishes',
        date: '2022-05-30T17:30:31.098Z',
        important: false
    },
    {
        id: 2,
        content: 'Do Homework',
        date: '2022-05-30T18:30:31.098Z',
        important: true
    },
    {
        id: 3,
        content: 'Take the dog out',
        date: '2022-05-29T11:30:31.098Z',
        important: true
    }
]

const generateId = () => {
    const maxId = todos.length > 0
      ? Math.max(...todos.map(n => n.id))
      : 0
    return maxId + 1
  }

morgan.token('body', req => {
return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(':method :url :status :response-time :body'))

app.get('/', (req, res) => {
  res.send('Todo app')
})

app.get('/api/todos', (req, res) => {
    res.json(todos)
})

app.get('/api/todos/:id', (req, res) => {
  const id = req.params.id
  const todo = todos.find(todo => todo.id == id)
  
  if (todo) {
    res.json(todo)
  } else {
    res.status(404).send(`The todo with id ${id} doesn't exist.`)
  }
  
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
    
    if (!body.content) {
        return response.status(400).json({ 
          error: 'content missing' 
        })
    }

    const todo = {
        id: generateId(),
        content: body.content,
        date: new Date(),
        important: body.important || false,
    }
    
    todos = todos.concat(todo)

    res.json(todo)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
    
app.use(unknownEndpoint)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))