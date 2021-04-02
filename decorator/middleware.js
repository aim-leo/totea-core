require('reflect-metadata')

const { array } = require('tegund')

function Middleware(...callbacks) {
  array('function').assert(callbacks)

  return function (target, key) {
    // get old data
    let middlewareFromDecorator = Reflect.getMetadata(
      'middlewareFromDecorator',
      target
    )

    // if the key is undefine, assign it to root
    if (!key) {
      middlewareFromDecorator = middlewareFromDecorator || []
      middlewareFromDecorator.unshift(...[].concat(callbacks).reverse())
    } else {
      middlewareFromDecorator = middlewareFromDecorator || {}

      if (!middlewareFromDecorator[key]) middlewareFromDecorator[key] = []

      middlewareFromDecorator[key].unshift(...[].concat(callbacks).reverse())
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
