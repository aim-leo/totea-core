require('reflect-metadata')

const assign = require('deep-extend')
const createHttpError = require('http-errors')
const { isObject } = require('tegund')
const routerOrder = require('sort-route-addresses')

const {kidnap  } = require('../helper')

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
      Reflect.getMetadata('routeFromDecorator', this.constructor) || {}

    // get the router define at decorator
    let routeFromDecorator =
      Reflect.getMetadata('routeFromDecorator', this) || {}

    // inject root router first, then inject special router define at method
    routeFromDecorator = assign(classRouteFromDecorator, routeFromDecorator)

    // get middleware define at decorator
    const middlewareFromDecorator =
      Reflect.getMetadata('middlewareFromDecorator', this) || {}

    for (const method in routeFromDecorator) {
      const list = routeFromDecorator[method]
      if (typeof this[method] !== 'function') {
        continue
      }

      const routeKeys = routerOrder(Object.keys(list))

      for (const url of routeKeys) {
        // get middleware
        const middleware = middlewareFromDecorator[list[url].name] || []
        
        console.log(`[totea route]: ${method} ${this.url ? this.url + url : url}`)

        this[method](url, ...middleware, async (req, res, next) => {
          // kidnap res.sendFile, after called this method, don't response the request
          kidnap(res, 'sendFile', () => {
            res.__fileSent__ = true
          })

          try {
            const result = await list[url].call(this, {
              req,
              res,
              next,
              query: req.query,
              body: req.body,
              header: req.header,
              params: req.params
            })

            if (result instanceof Error) next(result)

            if (res.headersSent || res.__fileSent__) return

            if (!result) {
              return next(createHttpError(500))
            }

            if (isObject(result) && result.message) {
              return res.json({ code: 200, ...result })
            }

            res.json({ code: 200, result, message: 'success' })
          } catch (e) {
            console.error(e)
            next(e)
          }
        })
      }
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
