const server = require('./server')
const controller = require('./controller')
const middleware = require('./middleware')
const method = require('./method')
const parameter = require('./parameter')

module.exports = {
  ...server,
  ...controller,
  ...middleware,
  ...method,
  ...parameter
}
