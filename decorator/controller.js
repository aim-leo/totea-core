require('reflect-metadata')

const humps = require('humps')

const { object } = require('tegund')

const { routeMixin } = require('../helper/route-mixin')

const express = require('../helper/express')

const controllerParamsInterface = object({})

const Controller = (name, option = {}) => Target => {
  const nameFromDecorator = Reflect.getMetadata('nameFromDecorator', Target)
  return class extends Target {
    constructor(_name, _option) {
      super()

      Object.assign(option, _option)
      controllerParamsInterface.assert(option)

      Object.assign(this, routeMixin)

      this.name = this._formatName(_name)
      this.option = option

      this._router = express.Router()
      this._isToteaController = true
      this._mappingRouterMethod(this._router)
    }

    get router() {
      return this.getRouter()
    }

    get url() {
      return '/' + humps.decamelize(this.name, { separator: '-' })
    }

    getRouter() {
      this._useDecorator()

      return this._router
    }

    _formatName(arg) {
      let controllerName = arg || name || nameFromDecorator

      if (typeof controllerName !== 'string') {
        throw new Error('Controller expected a string type name')
      }

      controllerName = controllerName.trim()
      if (controllerName[0] === '/') controllerName = controllerName.substr(1)

      if (!controllerName) {
        throw new Error('Controller expected a string type name')
      }

      if (controllerName.indexOf('/') !== -1) {
        throw new Error('Controller name can not have char: /')
      }

      return humps.camelize(controllerName)
    }
  }
}

module.exports = {
  Controller
}
