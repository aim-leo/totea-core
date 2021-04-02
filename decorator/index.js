const server = require('./server')
const controller = require('./controller')
const middleware = require('./middleware')
const method = require('./method')
const parameter = require('./parameter')
const logger = require('./logger')

module.exports = {
  ...server,
  ...controller,
  ...middleware,
  ...method,
  ...parameter,
  ...logger
}
