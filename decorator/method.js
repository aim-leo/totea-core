require('reflect-metadata')
const humps = require('humps')

const METHODS = ['Get', 'Post', 'Delete', 'Put', 'Patch']

function findCallbackBind(routes, callback) {
  for (const method in routes) {
    for (const url in routes[method]) {
      if (routes[method][url] === callback) {
        return { method, url }
      }
    }
  }
}

function Override() {
  return function (Target, key) {
    const overrideFromDecorator =
      Reflect.getMetadata('overrideFromDecorator', Target) || {}

    overrideFromDecorator[key] = true
    Reflect.defineMetadata(
      'overrideFromDecorator',
      overrideFromDecorator,
      Target
    )
  }
}

function Route(httpMethod, url) {
  httpMethod = httpMethod.toLowerCase()
  if (!METHODS.map(s => s.toLowerCase()).includes(httpMethod)) {
    throw new Error(
      `httpMethod expected at ${METHODS}, but got a ${httpMethod}`
    )
  }

  return function (Target, key) {
    // get old data
    const routeFromDecorator =
      Reflect.getMetadata('routeFromDecorator', Target) || {}

    if (!routeFromDecorator[httpMethod]) routeFromDecorator[httpMethod] = {}

    // find out the callback bind
    const bind = findCallbackBind(routeFromDecorator, Target[key])

    if (bind) {
      throw new Error(
        `the callback:${key} has already bound to url: ${bind.url}, method: ${bind.method}`
      )
    }

    const methodUrl = '/' + humps.decamelize(key, { separator: '-' })
    url = url || methodUrl

    if (routeFromDecorator[httpMethod][url]) {
      const overrideFromDecorator =
        Reflect.getMetadata('overrideFromDecorator', Target) || {}
      if (!overrideFromDecorator[key]) {
        throw new Error(
          `the url: ${url} has already bound, use @Override() decorator to replace it`
        )
      }
    }

    routeFromDecorator[httpMethod][url] = Target[key]

    Reflect.defineMetadata('routeFromDecorator', routeFromDecorator, Target)
  }
}

const methods = {}

METHODS.forEach(item => {
  methods[item] = url => Route(item, url)
})

module.exports = {
  Route,
  Override,
  ...methods
}
