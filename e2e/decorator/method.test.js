const request = require('supertest')
const { Server, Get, Post, Delete, Patch, Put, Override } = require('../../index')

Server.silence = true

it(`test all method`, async () => {
  @Server()
  class Service {
    @Get('/root')
    getRoot() {
      return 1
    }

    @Post('/root')
    postRoot() {
      return 1
    }

    @Delete('/root')
    deleteRoot() {
      return 1
    }

    @Patch('/root')
    patchRoot() {
      return 1
    }

    @Put('/root')
    putRoot() {
      return 1
    }
  }

  const service = new Service()
  await service.start()

  await request(service.app)
    .get('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  await request(service.app)
    .post('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  await request(service.app)
    .delete('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  await request(service.app)
    .patch('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  await request(service.app)
    .put('/root')
    .expect('Content-Type', /json/)
    .expect(200, { code: 200, result: 1, message: 'OK' })

  await service.stop()

  return Promise.resolve()
})

it(`can not bind same url`, () => {
  expect(() => {
    @Server()
    class Service {
      @Get('/root')
      root1() {
        return 1
      }

      @Get('/root') //  the GET /root has binded
      root2() {
        return 1
      }
    }

    const service = new Service()
    service.start()

    service.stop()
  }).toThrow()

  expect(() => {
    @Server()
    class Service {
      @Get('/root')
      root1() {
        return 1
      }

      @Get('/root')
      @Override() // if use Override
      root2() {
        return 1
      }
    }

    const service = new Service()
    service.start()

    service.stop()
  }).not.toThrow()
})

it(`can not bind diff url to same callback`, () => {
  expect(() => {
    @Server()
    class Service {
      @Get('/root')
      root() {  // it is root callback function
        return 1
      }

      @Get('/root2')
      root() {  // it is another root callback function
        return 2
      }
    }

    const service = new Service()
    service.start()

    service.stop()
  }).toThrow()
})

