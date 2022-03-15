const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  logger.error(error.message)

  next(error)
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!token || !decodedToken.id)
    return res.sendStatus(401).json({ error: 'token missing or invalid' })

  req.payload = decodedToken.id

  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  verifyToken
}