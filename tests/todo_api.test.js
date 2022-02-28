const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)

const Todo = require('../models/todo')
const User = require('../models/user')

beforeEach(async () => {
  await Todo.deleteMany({})

  const todoObjects = helper.initialTodos
    .map(todo => new Todo(todo))
  const promiseArray = todoObjects.map(todo => todo.save())
  await Promise.all(promiseArray)
})

test('notes are returned as json', async () => {
  await api
    .get('/api/todos')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all 2 notes are returned', async () => {
  const res = await api.get('/api/todos')

  expect(res.body).toHaveLength(2)
})

test('a specific todo is within the returned todos', async () => {
  const res = await api.get('/api/todos')

  const contents = res.body.map(r => r.content)
  expect(contents).toContain(
    'First todo'
  )
})

test('a valid todo without a valid token cannot be added', async () => {
  const newTodo = {
    content: 'Third todo',
    important: true,
  }

  await api
    .post('/api/todos')
    .send(newTodo)
    .expect(500)

  const res = await api.get('/api/todos')

  const contents = res.body.map(r => r.content)

  expect(res.body).toHaveLength(helper.initialTodos.length)
})

// test('todo without content is not added', async () => {
//   const newTodo = {
//     important: true
//   }

//   await api
//     .post('/api/todos')
//     .send(newTodo)
//     .expect(400)

//   const res = await api.get('/api/todos')

//   expect(res.body).toHaveLength(helper.initialTodos.length)
// })

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'timotest',
      name: 'Timo Testi',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})

afterAll(() => {
  mongoose.connection.close()
})