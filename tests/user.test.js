const mongoose = require('mongoose')
const supertest = require('supertest')

const User = require('../models/user')
const Todo = require('../models/todo')
const app = require('../app')
const api = supertest(app)

let receivedToken = null
let postId = null



beforeAll( async () => {
  //Clear the userdatabase
  await User.deleteMany()
  await Todo.deleteMany()
  //Create a test user
  await api.post('/api/signup')
    .send({
      username: 'test',
      name: 'Test Tetson',
      email: 'test@tetson.com',
      password: 'test123'
    })

  await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test123'
    })
    .then(response => {
      receivedToken = response.body.token
    })

  // expect(postId).toBeTruthy()
  expect(receivedToken).toMatch(/^[A-Za-z0-9-_=].[A-Za-z0-9-_=].?[A-Za-z0-9-_.+/=]*$/)
})

beforeEach( async () => {
  await api.post('/api/todos')
    .set('Authorization', `bearer ${receivedToken}`)
    .send({
      content: 'This is a todo',
      important: true
    })
    .then(response => {
      postId = response.body.id
    })

  expect(postId).toEqual(expect.anything())
})


test('#1 - All routes without token respond with 401 - invalid token', async () => {
  const response = await api.get('/')

  expect(response.body.error).toBe('invalid token')
  expect(response.statusCode).toBe(401)
}), 5000

test('#2 - All false routes with token respond with 404 - unknown endpoint', async () => {

  const response = await api.get('/')
    .set('Authorization', `bearer ${receivedToken}`)

  expect(response.body.error).toBe('unknown endpoint')
  expect(response.statusCode).toBe(404)
}), 5000

test('#2 - Should not signup a new user with username already in use', async () => {
  const response = await api.post('/api/signup')
    .send({
      username: 'test',
      name: 'Jest Jestson',
      email: 'jest@jestson.com',
      password: 'jest123'
    })

  expect(response.statusCode).toBe(409)
})

test('#3 - Should signup a new user', async () => {
  const response = await api.post('/api/signup')
    .send({
      username: 'omena',
      name: 'Omenainen omena',
      email: 'omena@omenainen.fi',
      password: 'omena'
    })

  expect(response.statusCode).toBe(201)
})

test('#4 - Should login a newly created user', async () => {
  const response = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test123'
    })

  expect(response.statusCode).toBe(200)
})

test('#5 - Logged user should be able to post new todos', async () => {
  const response = await api.post('/api/todos')
    .set('Authorization', `bearer ${receivedToken}`)
    .send({
      content: 'This is a test',
      important: false
    })

  expect(response.statusCode).toBe(201)
})

test('#6 - Logged user should be able to edit todos', async () => {

  const response = await api.put(`/api/todos/${postId}`)
    .set('Authorization', `bearer ${receivedToken}`)
    .send({
      content: 'This is a edit test',
      important: false
    })
    .expect(200)
  
  expect(response.body.content).toBe('This is a edit test')
})

afterAll(() => {
  mongoose.connection.close()
})