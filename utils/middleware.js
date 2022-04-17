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

const errorLogger = (err, req, res, next) => {
  logger.error({ error: err })
  next(err)
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }  else if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'invalid token'
    })
  }

  next(error)
}

const verifyToken = (error, req, res, next) => {
  const { TokenExpiredError } = jwt
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (error instanceof TokenExpiredError) {
    return res.sendStatus(401).json({ error: 'token expired' })
  }

  if (!token || !decodedToken.id)
    return res.sendStatus(401).json({ error: 'token missing or invalid' })

  req.payload = decodedToken.id

  next()
}


module.exports = {
  requestLogger,
  errorLogger,
  unknownEndpoint,
  errorHandler,
  verifyToken
}