const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Todo = require('../models/todo')

const initialTodos = [
  {
    content: 'First todo',
    date: new Date(),
    important: false,
    done: false
  },
  {
    content: 'Second todo',
    date: new Date(),
    important: true,
    done: false
  },
]

beforeEach(async () => {
  await Todo.deleteMany({})
  let todoObject = new Todo(initialTodos[0])
  await todoObject.save()
  todoObject = new Todo(initialTodos[1])
  await todoObject.save()
})

test('notes are returned as json', async () => {
  await api
    .get('/api/todos')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all 2 notes are returned', async () => {
  const response = await api.get('/api/todos')

  expect(response.body).toHaveLength(2)
})

test('a specific todo is within the returned todos', async () => {
  const response = await api.get('/api/todos')

  const contents = response.body.map(r => r.content)
  expect(contents).toContain(
    'First todo'
  )
})

test('a valid todo can be added', async () => {
  const newTodo = {
    content: 'Third todo',
    important: true,
  }

  await api
    .post('/api/todos')
    .send(newTodo)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/todos')

  const contents = response.body.map(r => r.content)

  expect(response.body).toHaveLength(initialTodos.length + 1)
  expect(contents).toContain(
    'Third todo'
  )
})

test('todo without content is not added', async () => {
  const newTodo = {
    important: true
  }

  await api
    .post('/api/todos')
    .send(newTodo)
    .expect(400)

  const response = await api.get('/api/todos')

  expect(response.body).toHaveLength(initialTodos.length)
})

afterAll(() => {
  mongoose.connection.close()
})