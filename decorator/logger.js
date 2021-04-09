const { createMiddlewareDecorator } = require('../helper')
const { kidnapResSendKey } = require('../middleware/kidnap')

const chalk = require('chalk')

const startTimeKey = Symbol()

function isEmptyObject(o) {
  return !o || (typeof o === 'object' && Object.keys(o).length === 0)
}

const Logger = createMiddlewareDecorator(({ req, res, next }) => {
  req[startTimeKey] = new Date()

  req.on('end', () => {
    console.log(res[kidnapResSendKey])
    const useTime =
      chalk.yellow(new Date().getTime() - req[startTimeKey].getTime()) + 'ms'
    const log = [
      '[totea logger]:',
      chalk.red(req[startTimeKey].toISOString()),
      chalk.cyan(req.originalUrl || req.url),
      chalk.green(req.method),
      isEmptyObject(req.params) ? undefined : JSON.stringify(req.params),
      isEmptyObject(req.body) ? undefined : JSON.stringify(req.body),
      res[kidnapResSendKey],
      useTime
    ].filter(item => item !== undefined)
    console.log(log.join(' '))
  })

  next()
})

module.exports = {
  Logger
}
