const createHttpError = require('http-errors')

const decorator = require('./decorator')
const express = require('./helper/express')

const { Server, Controller } = decorator

// create a Server class
class ToteaServer {}
ToteaServer = Server()(ToteaServer)

// create a Controller class
class ToteaController {}
ToteaController = Controller()(ToteaController)

module.exports = {
  ToteaServer,
  ToteaController,

  express,

  createHttpError,

  ...decorator
}
