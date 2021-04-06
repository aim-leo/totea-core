const createHttpError = require('http-errors')
const request = require('supertest')
const { Server, Get, Post, Middleware, Controller } = require('../../index')

Server.silence = true

it(`override global middleware when instantiate`, async () => {
  const middlewareA = jest.fn((req, res, next) => {
    next()
  })

  const middlewareB = jest.fn((req, res, next) => {
    next()
  })

  @Server({
    middleware: [middlewareA]
  })
  class Service {
    @Get()
    root() {
      return 1
    }
  }

  const service = new Service({
    middleware: [middlewareB]
  })
  await service.start()

  expect(middlewareA).toHaveBeenCalledTimes(0)
  expect(middlewareB).toHaveBeenCalledTimes(0)

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(middlewareA).toHaveBeenCalledTimes(0)
  expect(middlewareB).toHaveBeenCalledTimes(1)

  await service.stop()

  return Promise.resolve()
})

it(`set middleware for specific router`, async () => {
  const globalMiddleware = jest.fn((req, res, next) => {
    next()
  })

  const specificMiddleware = jest.fn((req, res, next) => {
    next()
  })

  const specificPostMiddleware = jest.fn((req, res, next) => {
    next()
  })

  @Server({
    middleware: [globalMiddleware]
  })
  class Service {
    @Get('/root')
    @Middleware(specificMiddleware)
    getRoot() {
      return 1
    }

    @Post('/root')
    @Middleware(specificPostMiddleware)
    postRoot() {
      return 2
    }
  }

  const service = new Service()
  await service.start()

  expect(globalMiddleware).toHaveBeenCalledTimes(0)
  expect(specificMiddleware).toHaveBeenCalledTimes(0)
  expect(specificPostMiddleware).toHaveBeenCalledTimes(0)

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(globalMiddleware).toHaveBeenCalledTimes(1)
  expect(specificMiddleware).toHaveBeenCalledTimes(1)
  expect(specificPostMiddleware).toHaveBeenCalledTimes(0)

  await request(service.app)
    .post('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 2, message: 'OK' })

  expect(globalMiddleware).toHaveBeenCalledTimes(2)
  expect(specificMiddleware).toHaveBeenCalledTimes(1)
  expect(specificPostMiddleware).toHaveBeenCalledTimes(1)

  await service.stop()

  return Promise.resolve()
})

it(`use Middleware decorator to set global middleware`, async () => {
  const middlewareA = jest.fn((req, res, next) => {
    next()
  })

  const middlewareB = jest.fn((req, res, next) => {
    next()
  })

  const middlewareC = jest.fn((req, res, next) => {
    next()
  })

  @Server({
    middleware: [middlewareA]
  })
  @Middleware(middlewareC) // the middleware define by decorator can not be override
  class Service {
    @Get()
    root() {
      return 1
    }
  }

  const service = new Service({
    middleware: [middlewareB]
  })
  await service.start()

  expect(middlewareA).toHaveBeenCalledTimes(0)
  expect(middlewareB).toHaveBeenCalledTimes(0)
  expect(middlewareC).toHaveBeenCalledTimes(0)

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(middlewareA).toHaveBeenCalledTimes(0)
  expect(middlewareB).toHaveBeenCalledTimes(1)
  expect(middlewareC).toHaveBeenCalledTimes(1)

  await service.stop()

  return Promise.resolve()
})

it(`middleware called order`, async () => {
  const list = []
  function createNamedMiddleware(name) {
    return (req, res, next) => {
      list.push(name)

      next()
    }
  }

  @Controller('childRoute')
  @Middleware(createNamedMiddleware('(A)'))
  @Middleware(createNamedMiddleware('(B)'))
  class ChildController {
    @Get('/address') // GET /child-route/address
    @Middleware(createNamedMiddleware('(C)'))
    @Middleware(createNamedMiddleware('(D)'))
    getAddress() {
      return 'ok'
    }
  }

  @Server({
    middleware: [createNamedMiddleware('A'), createNamedMiddleware('B')],
    controller: [ChildController]
  })
  @Middleware(createNamedMiddleware('C'))
  @Middleware(createNamedMiddleware('D'))
  class Service {
    @Get()
    @Middleware(createNamedMiddleware('E'))
    @Middleware(createNamedMiddleware('F'))
    root() {
      return 1
    }

    @Get()
    @Middleware((req, res, next) => {
      if (!req.query.name) {
        next(createHttpError(400))
      }

      next()
    })
    @Middleware(createNamedMiddleware('I'))
    @Middleware(createNamedMiddleware('J'))
    root2() {
      return 1
    }
  }

  const service = new Service({
    middleware: [createNamedMiddleware('G'), createNamedMiddleware('H')]
  })
  await service.start()

  expect(list.length).toBe(0)

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(list.join('')).toBe('GHCDEF')

  list.length = 0 // clear

  await request(service.app)
    .get('/root2')
    .expect('Content-Type', /json/)
    .expect(200, { code: 400, message: 'Bad Request' })

  expect(list.join('')).toBe('GHCD')

  list.length = 0 // clear

  await request(service.app)
    .get('/root2?name=tony')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(list.join('')).toBe('GHCDIJ')

  list.length = 0 // clear

  // child route
  await request(service.app)
    .get('/child-route/address')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 'ok', message: 'OK' })

  expect(list.join('')).toBe('GHCD(A)(B)(C)(D)')

  await service.stop()

  return Promise.resolve()
})
