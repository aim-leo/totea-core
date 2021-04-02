require('reflect-metadata')

const createHttpError = require('http-errors')
const { isObject } = require('tegund')
const routerOrder = require('sort-route-addresses')

const { kidnapResSendKey } = require('../middleware/kidnap')

function overrideRoute(source, target) {
  for (const item of source) {
    if (
      target.filter(
        targetItem =>
          targetItem.url === item.url && targetItem.method === item.method
      ).length === 0
    ) {
      target.push(item)
    }
  }

  return target
}

const routeMixin = {
  _assignRouterFromDecorator() {
    // find out the global middleware
    const globalMiddlewareFromDecorator =
      Reflect.getMetadata('middlewareFromDecorator', this.constructor) || []
    if (
      Array.isArray(globalMiddlewareFromDecorator) &&
      globalMiddlewareFromDecorator.length > 0
    ) {
      this.use(...globalMiddlewareFromDecorator)
    }

    // get the router define at controler class
    const classRouteFromDecorator =
      Reflect.getMetadata('routeFromDecorator', this.constructor) || []

    // get the router define at decorator
    let routeFromDecorator =
      Reflect.getMetadata('routeFromDecorator', this) || []

    // inject root router first, then inject special router define at method
    routeFromDecorator = overrideRoute(
      classRouteFromDecorator,
      routeFromDecorator
    )

    const toRankAddress = item => `${item.method.toUpperCase()} ${item.url}`

    const sortedList = routerOrder(routeFromDecorator.map(toRankAddress))

    // get middleware define at decorator
    const middlewareFromDecorator =
      Reflect.getMetadata('middlewareFromDecorator', this) || {}

    for (const key of sortedList) {
      const { method, url, callback, callbackName } = routeFromDecorator.filter(
        item => toRankAddress(item) === key
      )[0]
      if (typeof this[method] !== 'function') {
        continue
      }

      // get middleware
      const middleware = middlewareFromDecorator[callbackName] || []

      console.log(`[totea route]: ${method}`, this.url ? this.url + url : url)

      this[method](url, ...middleware, async (req, res, next) => {
        try {
          const result = await callback.call(this, {
            req,
            res,
            next,
            query: req.query,
            body: req.body,
            header: req.header,
            params: req.params
          })

          if (result instanceof Error) next(result)

          if (res.headersSent || res[kidnapResSendKey]) return

          if (!result) {
            return next(createHttpError(500))
          }

          if (isObject(result) && (result.message || result.code)) {
            return res.json({ code: 200, ...result })
          }

          res.json({ code: 200, result, message: 'success' })
        } catch (e) {
          console.error(e)
          next(e)
        }
      })
    }
  },
  _mappingRouterMethod(originObj) {
    const list = ['use', 'all', 'get', 'post', 'delete', 'put', 'patch']

    for (const method of list) {
      this[method] = originObj[method].bind(originObj)
    }
  }
}

module.exports = {
  routeMixin
}
