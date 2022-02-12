const express = require('express')
const app = express()
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`))