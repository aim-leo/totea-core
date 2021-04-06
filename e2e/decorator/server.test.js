const createHttpError = require('http-errors')
const request = require('supertest')

const { Server, Get } = require('../../index')

Server.silence = true

it(`set port onServe onClose at Server decorator`, async () => {
  const onServe = jest.fn()
  const onClose = jest.fn()

  @Server({
    port: 4000,
    onServe,
    onClose
  })
  class Service {}

  const service = new Service()

  expect(service.app.settings.port).toBe(4000)

  expect(onServe).toHaveBeenCalledTimes(0)
  expect(service.runing).toBe(false)

  await service.start()
  expect(onServe).toHaveBeenCalledTimes(1)
  expect(service.runing).toBe(true)

  await request(service.app)
    .get('/')
    .expect('Content-Type', /json/)
    .expect(200, { code: 404, message: 'Not Found' })

  expect(onClose).toHaveBeenCalledTimes(0)
  await service.stop()
  expect(onClose).toHaveBeenCalledTimes(1)
  expect(service.runing).toBe(false)

  await service.start()
  expect(onServe).toHaveBeenCalledTimes(2)
  expect(service.runing).toBe(true)
  await service.stop()
  expect(onClose).toHaveBeenCalledTimes(2)
  expect(service.runing).toBe(false)

  return Promise.resolve()
})

it(`set global middleware at Server`, async () => {
  const middleware = jest.fn((req, res, next) => {
    next()
  })

  @Server({
    middleware: [middleware]
  })
  class Service {
    @Get()
    root() {
      return 1
    }
  }

  const service = new Service()
  await service.start()

  expect(middleware).toHaveBeenCalledTimes(0)

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(middleware).toHaveBeenCalledTimes(1)

  await service.stop()

  return Promise.resolve()
})

it(`set global error middleware at Server`, async () => {
  const errorMiddleware = jest.fn((error, req, res, next) => {
    next(error)
  })

  const error = createHttpError(400)

  @Server({
    errorMiddleware: [errorMiddleware]
  })
  class Service {
    @Get()
    root({ query }) {
      if (query.name === 'tony') {
        throw error
      }
      return 1
    }
  }

  const service = new Service()
  await service.start()

  expect(errorMiddleware).toHaveBeenCalledTimes(0)

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  expect(errorMiddleware).toHaveBeenCalledTimes(0)

  await request(service.app)
    .get('/root?name=tony')
    .expect('Content-Type', /json/)
    .expect(200, { code: 400, message: 'Bad Request' })

  expect(errorMiddleware).toBeCalledWith(
    error,
    expect.anything(),
    expect.anything(),
    expect.anything()
  )

  await service.stop()

  return Promise.resolve()
})

it(`set static path at Server`, async () => {
  @Server({
    static: ['./public']
  })
  class Service {
    @Get()
    root() {
      return 1
    }

    @Get('/html')
    getHtml({ res }) {
      res.sendFile('test.html', { root: 'public' })
    }
  }

  const service = new Service()
  await service.start()

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  await request(service.app)
    .get('/test.json')
    .expect('Content-Type', /json/)
    .expect(200, { name: 'test' })

  await request(service.app)
    .get('/test.jpg')
    .expect('Content-Type', 'image/jpeg')

  await request(service.app)
    .get('/html')
    .expect('Content-Type', 'text/html; charset=UTF-8')
    .expect(200)
    .then(response => {
      if (response.res.text.indexOf('test page') === -1) {
        throw new Error()
      }
    })

  await service.stop()

  return Promise.resolve()
})

it(`set view at Server`, async () => {
  @Server({
    view: {
      path: './jades',
      engine: require('pug'),
      type: 'pug'
    }
  })
  class Service {
    @Get('/jade')
    getJade({ res }) {
      res.render('index', { title: 'totea jade page' })
    }

    @Get('/error')
    getError({ res }) {
      const error = createHttpError(401)
      res.render('error', {
        message: error.message,
        error: error
      })
    }

    @Get('/json')
    getJson({ res }) {
      res.json({ data: 1 })
    }
  }

  const service = new Service()
  await service.start()

  await request(service.app)
    .get('/json')
    .expect('Content-Type', /json/)
    .expect(200, { data: 1 })

  await request(service.app)
    .get('/jade')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .then(response => {
      if (response.res.text.indexOf('totea jade page') === -1) {
        throw new Error()
      }
    })

  await request(service.app)
    .get('/error')
    .expect('Content-Type', 'text/html; charset=utf-8')
    .expect(200)
    .then(response => {
      if (response.res.text.indexOf('401') === -1) {
        throw new Error()
      }
      if (response.res.text.indexOf('Unauthorized') === -1) {
        throw new Error()
      }
    })

  await service.stop()

  return Promise.resolve()
})
