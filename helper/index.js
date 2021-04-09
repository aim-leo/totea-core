const { func } = require('tegund')
const { Middleware } = require('../decorator/middleware')

function kidnap(targetObj, methodName, kidnapMethod) {
  const oldMethod = targetObj[methodName]

  if (typeof oldMethod !== 'function') {
    throw new Error(`${methodName} expected a function`)
  }

  if (typeof kidnapMethod !== 'function') {
    throw new Error(`kidnap method expected a function`)
  }

  const newFunction = function (...args) {
    oldMethod.call(targetObj, ...args)
    kidnapMethod(...args)
  }

  targetObj[methodName] = newFunction

  return newFunction
}

function createMiddlewareDecorator(callback) {
  func().assert(callback)

  return args =>
    Middleware((req, res, next) => {
      callback({ req, res, next, args })
    })
}

module.exports = {
  kidnap,
  createMiddlewareDecorator
}
