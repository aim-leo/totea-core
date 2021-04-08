require('reflect-metadata')

const createHttpError = require('http-errors')
const { isObject, isInteger, isString } = require('tegund')
const routerOrder = require('sort-route-addresses')
const httpMessage = require('statuses') // import from http-errors

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
  _useDecorator() {
    this._useGlobalMiddleware()

    this._useRouterFromDecorator()
  },
  _useGlobalMiddleware() {
    // find out the global middleware
    const globalMiddlewareFromDecorator =
      Reflect.getMetadata('middlewareFromDecorator', this.constructor) || []
    if (
      Array.isArray(globalMiddlewareFromDecorator) &&
      globalMiddlewareFromDecorator.length > 0
    ) {
      this.use(...globalMiddlewareFromDecorator)
    }
  },
  _getRouteFromDecorator() {
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

    return routeFromDecorator
  },
  _useRouterFromDecorator() {
    const server = this._isToteaController ? this.server : this

    const routeFromDecorator = this._getRouteFromDecorator()
    // eg: transfrom get('/route') to GET /route
    const toRankAddress = item => `${item.method.toUpperCase()} ${item.url}`
    // sort the route, the matching-routing will be place at last
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

      if (server.silence !== true) {
        console.log(`[totea route]: ${method}`, this.url ? this.url + url : url)
      }

      // add to route
      this[method](url, ...middleware, async (req, res, next) => {
        function response(json) {
          if (json.status === undefined) {
            json.status = 200
          }

          if (json.message === undefined) {
            json.message = httpMessage[json.status]
          }

          server.onResponse({
            res,
            status: json.status,
            message: json.message,
            result: json.result
          })
        }

        try {
          const result = await callback.call(this, {
            req,
            res,
            next,
            query: req.query,
            body: req.body,
            headers: req.headers,
            params: req.params
          })

          // prevent response twice
          if (res.headersSent || res[kidnapResSendKey]) return

          if (result instanceof Error) {
            return next(result)
          }

          if (result === undefined) {
            return next(createHttpError(500))
          }

          if (
            isObject(result) &&
            ((result.message && isString(result.message)) ||
              isInteger(result.status))
          ) {
            return response(result)
          }

          response({ result })
        } catch (e) {
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
