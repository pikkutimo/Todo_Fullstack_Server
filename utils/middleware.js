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

  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).send({ error: 'Token exprired!' })
  } else if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).send({ error: 'Token missing or invalid!' })
  }
  else if (error.name === 'CastError') {
    return res.status(400).send({ error: 'Malformatted id!' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  let decodedToken

  try {
    decodedToken = jwt.verify(token, process.env.SECRET)
    req.payload = decodedToken.id
    next()
  } catch(error) {
    next(error)
  }
  // const { TokenExpiredError } = jwt
  // const authHeader = req.headers['authorization']
  // const token = authHeader && authHeader.split(' ')[1]
  // const decodedToken = jwt.verify(token, process.env.SECRET)

  // // if (error instanceof TokenExpiredError) {
  // //   return res.sendStatus(401).json({ error: 'token expired' })
  // // }

  // if (!token || !decodedToken.id)
  //   return res.sendStatus(401).json({ error: 'token missing or invalid' })
  //
  // next()
}


module.exports = {
  requestLogger,
  errorLogger,
  unknownEndpoint,
  errorHandler,
  verifyToken
}