const mongoose = require('mongoose')
const supertest = require('supertest')

const User = require('../models/user')
const Todo = require('../models/todo')
const app = require('../app')
const api = supertest(app)

let receivedToken = null
let postId = null

beforeEach( async () => {
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

  const response2 = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test123'
    })

  receivedToken = response2.body.token

  const response3 = await api.post('/api/todos')
    .set('Authorization', `bearer ${receivedToken}`)
    .send({
      content: 'This is a todo',
      important: true
    })

  postId = await response3.body.id
})

test('Should not signup a new user with username already in use', async () => {
  const response = await api.post('/api/signup')
    .send({
      username: 'test',
      name: 'Jest Jestson',
      email: 'jest@jestson.com',
      password: 'jest123'
    })

  expect(response.statusCode).toBe(409)
})

test('Should signup a new user', async () => {
  const response = await api.post('/api/signup')
    .send({
      username: 'omena',
      name: 'Omenainen omena',
      email: 'omena@omenainen.fi',
      password: 'omena'
    })

  expect(response.statusCode).toBe(201)
})

test('Should login a newly created user', async () => {
  const response = await api.post('/api/login')
    .send({
      username: 'test',
      password: 'test123'
    })

  expect(response.statusCode).toBe(200)
})

test('Logged user should be able to post new todos', async () => {
  const response = await api.post('/api/todos')
    .set('Authorization', `bearer ${receivedToken}`)
    .send({
      content: 'This is a test',
      important: false
    })

  expect(response.statusCode).toBe(201)
})

test('Logged user should be able to edit todos', async () => {

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