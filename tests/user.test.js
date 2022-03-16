const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)

let receivedToken = null

beforeEach( async () => {
  //Clear the userdatabase
  await User.deleteMany()
  //Create a test user
  const response = await api.post('/api/signup')
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
})

test('Should not signup a new user with username already in use', async () => {
  const response = await api.post('/api/signup')
    .send({
      username: 'test',
      name: 'Jest Jestson',
      email: 'jest@jestson.com',
      password: 'jest123'
    })

  expect(response.statusCode).toBe(400)
})

test('Should signup a new user', async () => {
  const response = await api.post('/api/signup')
    .send({
      username: 'Jest',
      name: 'Jest Jestson',
      email: 'jest@jestson.com',
      password: 'jest123'
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

afterAll(() => {
  mongoose.connection.close()
})