const { Server, Get, createHttpError } = require('../../index')

@Server()
class Service {
  @Get('/error_res') // response by youself, got: {"code":401,"message":"Unauthorized"}
  errorRes({ res }) {
    res.json({ code: 401, message: 'Unauthorized' })
  }

  @Get('/error_code') // return a Promise.reject, got: {"code":404,"message":"Not Found"}
  errorCode() {
    return Promise.reject(404)
  }

  @Get('/error_message') // return a Promise.reject, got: {"code":400,"message":"this is the invalid message"}
  errorMessage() {
    return Promise.reject('this is the invalid message')
  }

  @Get('/error_code_message') // return a Promise.reject, got: {"code":410,"message":"this is the invalid message"}
  errorCodeAndMessage() {
    return Promise.reject({
      status: 410,
      message: 'this is the invalid message'
    })
  }

  @Get('/http_error') // return a http error, got: {"code":401,"message":"Unauthorized"}
  httpError() {
    return createHttpError(401)
  }

  @Get('/return_simple_error') // return a normal error, got {"code":406,"message":"this is a error message"}
  returnSimpleError() {
    // return a promise.reject
    const e = new Error('this is a error message')

    e.status = 406

    return e
  }

  @Get('/throw_simple_error') // throw a normal error, got {"code":406,"message":"this is a error message"}
  throwSimpleError() {
    // return a promise.reject
    const e = new Error('this is a error message')

    e.status = 406

    throw e
  }
}

const service = new Service()

service.start()
