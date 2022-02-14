const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const todoRouter = require('./controllers/todos')
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
app.use(middleware.requestLogger)

app.use('/api/todos', todoRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app