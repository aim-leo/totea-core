require('reflect-metadata')

const { ObjectT, isObject } = require('tegund')
const createHttpError = require('http-errors')

const PARAMETERS = ['Body', 'Query', 'Params', 'Headers']

function Parameter(paramType, validator, errorMessage) {
  if (typeof paramType !== 'string') {
    throw new Error('paramType expected a string')
  }
  paramType = paramType.toLowerCase()
  if (!PARAMETERS.map(s => s.toLowerCase()).includes(paramType)) {
    throw new Error(
      `paramType expected at ${PARAMETERS}, but got a ${paramType}`
    )
  }

  if (validator instanceof ObjectT) {
    const t = validator
    validator = val => t.test(val)
  } else if (isObject(validator)) {
    const t = new ObjectT(validator)
    validator = val => t.test(val)
  } else if (typeof validator !== 'function') {
    throw new Error('validator expected a ObjectT || object || function')
  }

  return function (target, key) {
    let middlewareFromDecorator = Reflect.getMetadata(
      'middlewareFromDecorator',
      target
    )

    if (!key) {
      throw new Error('Paramter is only can use as a method decorator')
    }

    middlewareFromDecorator = middlewareFromDecorator || {}
    if (!middlewareFromDecorator[key]) middlewareFromDecorator[key] = []

    middlewareFromDecorator[key].unshift((req, res, next) => {
      const data = req[paramType]
      const result = validator(data)

      if (result === false) {
        throw createHttpError(400, errorMessage)
      }

      if (result instanceof Error) {
        throw createHttpError(400, result.message || errorMessage)
      }

      if (typeof result === 'string') {
        throw createHttpError(400, result || errorMessage)
      }

      if (typeof result === 'number') {
        throw createHttpError(result, errorMessage)
      }

      next()
    })

    Reflect.defineMetadata(
      'middlewareFromDecorator',
      middlewareFromDecorator,
      target
    )
  }
}

const parameters = {}

PARAMETERS.forEach(item => {
  parameters[item] = (...args) => Parameter(item, ...args)
})

module.exports = {
  Parameter,
  ...parameters
}
