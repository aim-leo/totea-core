require('reflect-metadata')

const { routeMixin } = require('./mixin')

const express = require('../helper/express')

const Controller = name => Target => {
  const nameFromDecorator = Reflect.getMetadata('nameFromDecorator', Target)

  if (!name && !nameFromDecorator) {
    throw new Error('Controller expected a string type name')
  }

  return class extends Target {
    constructor() {
      super()

      Object.assign(this, routeMixin)

      this.name = name || nameFromDecorator

      this._router = express.Router()
      this._isToteaController = true
      this._mappingRouterMethod(this._router)
    }

    get router() {
      return this.getRouter()
    }

    get url() {
      return (this.name[0] !== '/' ? '/' : '') + this.name
    }

    getRouter() {
      this._assignRouterFromDecorator()

      return this._router
    }
  }
}

module.exports = {
  Controller
}
