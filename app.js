const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
require('express-async-errors')
const todoRouter = require('./controllers/todos')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const signupRouter = require('./controllers/signup')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB: ', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(middleware.requestLogger)

app.use('/api/login', loginRouter)
app.use('/api/signup', signupRouter)
app.use(middleware.verifyToken)
app.use('/api/todos', todoRouter)
app.use('/api/users', userRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app