require('reflect-metadata')

function Middleware(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Middleware expected a function')
  }

  return function (target, key) {
    // get old data
    let middlewareFromDecorator = Reflect.getMetadata(
      'middlewareFromDecorator',
      target
    )

    // if the key is undefine, assign it to root
    if (!key) {
      middlewareFromDecorator = middlewareFromDecorator || []
      middlewareFromDecorator.push(callback)
    } else {
      middlewareFromDecorator = middlewareFromDecorator || {}

      if (!middlewareFromDecorator[key]) middlewareFromDecorator[key] = []

      middlewareFromDecorator[key].push(callback)
    }

    Reflect.defineMetadata(
      'middlewareFromDecorator',
      middlewareFromDecorator,
      target
    )
  }
}

module.exports = {
  Middleware
}
