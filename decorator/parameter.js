require('reflect-metadata')

const { ObjectT } = require('tegund')
const createHttpError = require('http-errors')

const PARAMETERS = ['Body', 'Query', 'Params', 'Header']

function Parameter(paramType, validator) {
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
    validator = val => t.assert(val)
  } else if (typeof validator !== 'function') {
    throw new Error('validator expected a ObjectT or a function')
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

    middlewareFromDecorator[key].push((req, res, next) => {
      const data = req[paramType]
      const result = validator(data)

      if (result === false || result instanceof Error) {
        throw createHttpError(400)
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
  parameters[item] = url => Parameter(item, url)
})

module.exports = {
  Parameter,
  ...parameters
}
