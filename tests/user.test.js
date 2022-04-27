const mongoose = require('mongoose')
const supertest = require('supertest')

const userTools = require('../utils/userTools')
const User = require('../models/user')
const Todo = require('../models/todo')
const app = require('../app')
const RefreshToken = require('../models/refreshToken')
const api = supertest(app)

describe("Test the paths", () => {
  let receivedToken = null
  let postId = null
  let userId = null
  let refreshToken = null

  beforeAll( async () => {
    //Clear the userdatabase
    await User.deleteMany()
    await Todo.deleteMany()
    await RefreshToken.deleteMany()
    //Create a test user
    await api.post('/api/signup')
      .send({
        username: 'test',
        name: 'Test Tetson',
        email: 'test@tetson.com',
        password: 'test123'
      })
      .then(response => {
        userId = response.body.id
      })

    await api.post('/api/login')
      .send({
        username: 'test',
        password: 'test123'
      })
      .then(response => {
        receivedToken = response.body.token
        refreshToken = response.body.refreshToken
      })

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

    expect(response.body.error).toBe('Token missing or invalid!')
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

    expect(response.body.error).toBe('Existing username or email!')
    expect(response.statusCode).toBe(401)
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

  test('#5 - Refresh token should match uuid v4', async () => {
    const response = await api.post('/api/login')
      .send({
        username: 'test',
        password: 'test123'
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.refreshToken).toMatch(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/)
  })

  test('#6 - Logged user should be able to post new todos', async () => {
    const response = await api.post('/api/todos')
      .set('Authorization', `bearer ${receivedToken}`)
      .send({
        content: 'This is a test',
        important: false
      })

    expect(response.statusCode).toBe(201)
  })

  test('#7 - Logged user should be able to edit todos', async () => {

    const response = await api.put(`/api/todos/${postId}`)
      .set('Authorization', `bearer ${receivedToken}`)
      .send({
        content: 'This is a edit test',
        important: false
      })
      .expect(200)

    expect(response.body.content).toBe('This is a edit test')
  })

  test('#8 - Logged user should be able delete todos by id', async () => {

    await api.delete(`/api/todos/${postId}`)
      .set('Authorization', `bearer ${receivedToken}`)
      .expect(204)
  })

  test('#9 - Logged user should be able to edit userprofile', async () => {

    await api.put(`/api/users/${userId}`)
      .set('Authorization', `bearer ${receivedToken}`)
      .send({
        username: 'jest',
        name: 'Jest Jettison',
        password: 'test123',
        email: 'jest@jestson.com'
      })
      .expect(200)
  }), 10000

  test('#10 - With refreshToken, user can create new accessToken', async () => {

    const response = await api.post('/api/refresh/')
      .send({
        requestToken: refreshToken,
        username: 'jest'
      })
      .expect(200)

    expect(response.body.token).toMatch(/^[A-Za-z0-9-_=].[A-Za-z0-9-_=].?[A-Za-z0-9-_.+/=]*$/)
    expect(response.body.token).not.toEqual(receivedToken)
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})

describe("Test the methods of userTools", () => {

  test('#1 - createToken creates a valid jsonwebtoken', () => {
    const username = 'test'
    const id = '6260c7e3c9bd5385c28e8000'

    const token = userTools.createToken(username, id)

  expect(token).toMatch(/^[A-Za-z0-9-_=].[A-Za-z0-9-_=].?[A-Za-z0-9-_.+/=]*$/)
  })

  test('#2 - hashPassword creates a valid, recreatable hash', () => {
    const password = 'test'

    const hash = userTools.hashPassword(password)
    const comparisonHash = userTools.hashPassword(password)

  expect(hash).toEqual(comparisonHash)
  })
})