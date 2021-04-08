const { Server, Get, createHttpError } = require('../../index')

@Server()
class Service {
  // response by youself, got: {"status":401,"message":"Unauthorized"}
  @Get('/error_res')
  errorRes({ res }) {
    res.json({ status: 401, message: 'Unauthorized' })
  }

  // return a Promise.reject， with a http code, got: {"status":404,"message":"Not Found"}
  @Get('/error_code')
  errorCode() {
    return Promise.reject(404)
  }

  // return a Promise.reject, with a error message, got: {"status":400,"message":"this is the invalid message"}
  @Get('/error_message')
  errorMessage() {
    return Promise.reject('this is the invalid message')
  }

  // return a Promise.reject, with http code and message, got: {"status":410,"message":"this is the invalid message"}
  @Get('/error_code_message')
  errorCodeAndMessage() {
    return Promise.reject({
      status: 410,
      message: 'this is the invalid message'
    })
  }

  // return a http error, got: {"status":401,"message":"Unauthorized"}
  @Get('/http_error')
  httpError() {
    return createHttpError(401)
  }

  // throw a http error, got: {"status":401,"message":"Unauthorized"}
  @Get('/http_error')
  httpError() {
    throw createHttpError(401)
  }

  // return a normal error, got {"status":406,"message":"this is a error message"}
  @Get('/return_simple_error')
  returnSimpleError() {
    const e = new Error('this is a error message')

    e.status = 406

    return e
  }

  // throw a normal error, got {"status":406,"message":"this is a error message"}
  @Get('/throw_simple_error')
  throwSimpleError() {
    const e = new Error('this is a error message')

    e.status = 406

    throw e
  }
}

const service = new Service()

service.start()
