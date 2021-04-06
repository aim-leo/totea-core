const request = require('supertest')
const { Server, Controller, Get, Middleware } = require('../../index')

Server.silence = true

it(`add a simple controller`, async () => {
  @Controller('childRoute')
  class ChildController {
    @Get('/address') // GET /child-route/address
    getAddress() {
      return 'ok'
    }

    @Get(/ane/) // match GET /child-route/lane /child-route/ane ...
    matchAne() {
      return 'ok2'
    }
  }

  @Server({
    controller: [ChildController]
  })
  class Service {}

  const service = new Service()
  await service.start()

  await request(service.app)
    .get('/')
    .expect('Content-Type', /json/)
    .expect(200, { code: 404, message: 'Not Found' })

  await request(service.app)
    .get('/child-route')
    .expect('Content-Type', /json/)
    .expect(200, { code: 404, message: 'Not Found' })

  await request(service.app)
    .get('/child-route/address')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 'ok', message: 'OK' })

  await request(service.app)
    .get('/child-route/lane')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 'ok2', message: 'OK' })

  await service.stop()

  return Promise.resolve()
})
