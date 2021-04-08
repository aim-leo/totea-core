const request = require('supertest')
const { object, string, integer } = require('tegund')
const { Server, Body, Query, Params, Headers, Post } = require('../../index')

Server.silence = true

it(`test all paramter`, async () => {
  @Server()
  class Service {
    @Post('/:id')
    @Query(query => query.name === 'tony') // only query.name === 'tony' can pass
    @Body(body => !!body.address) // the body.address should provided
    @Params(params => !!params.id) // the params.id should provided
    @Headers(headers => !!headers.token) // the headers.token should provided
    postRoot() {
      return 1
    }
  }

  const service = new Service()
  await service.start()

  await request(service.app)
    .post('/')
    .expect('Content-Type', /json/)
    .expect(200, { status: 404, message: 'Not Found' })

  await request(service.app)
    .post('/1')
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'Bad Request' })

  await request(service.app)
    .post('/1?name=tony')
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'Bad Request' })

  await request(service.app)
    .post('/1?name=tony')
    .send({ address: 'address' })
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'Bad Request' })

  await request(service.app)
    .post('/1?name=tony')
    .send({ address: 'address' })
    .set('token', 'token')
    .expect('Content-Type', /json/)
    .expect(200, { status: 200, result: 1, message: 'OK' })

  await service.stop()

  return Promise.resolve()
})

it(`use tegund as a paramter validator`, async () => {
  @Server()
  class Service {
    @Post('/user')
    @Body(
      object({
        name: string().min(3).max(10),
        age: integer().min(1)
      })
    )
    addUser({ body }) {
      return { result: body, message: 'add user success' }
    }
  }

  const service = new Service()
  await service.start()

  await request(service.app)
    .post('/user')
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'field name validate error, expected a String type, got a [object Undefined]' })

  await request(service.app)
    .post('/user')
    .send({ name: 123 })
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'field name validate error, expected a String type, got a [object Number]' })

  await request(service.app)
    .post('/user')
    .send({ name: '1' })
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'field name validate error, expected a String, length gte than 3, but got a length: 1' })

  await request(service.app)
    .post('/user')
    .send({ name: '12345678901234567890' })
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'field name validate error, expected a String, length lte than 10, but got a length: 20' })

  await request(service.app)
    .post('/user')
    .send({ name: 'tony' })
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'field age validate error, expected a Integer type, got a [object Undefined]' })

  await request(service.app)
    .post('/user')
    .send({ name: 'tony', age: -1 })
    .expect('Content-Type', /json/)
    .expect(200, { status: 400, message: 'field age validate error, expected a Integer, value gte than 1, but got a: -1' })

  const user = { name: 'leo', age: 18 }
  await request(service.app)
    .post('/user')
    .send(user)
    .expect('Content-Type', /json/)
    .expect(200, { status: 200, result: user, message: 'add user success' })

  await service.stop()

  return Promise.resolve()
})


it(`paramter can only provided a function | tegund object | normal Object`, () => {
  expect(() => {
    @Server()
    class Service {
      @Post('/root')
      @Body(  // also can provide a normal Object, same as object(Object)
        {
          name: string().min(3).max(10),
          age: integer().min(1)
        }
      )
      root() {
        return 1
      }
    }

    const service = new Service()
    service.start()

    service.stop()
  }).not.toThrow()

  expect(() => {
    @Server()
    class Service {
      @Post('/root')
      @Body(1)
      root() {
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
      @Post('/root')
      @Body(true)
      root() {
        return 1
      }
    }

    const service = new Service()
    service.start()

    service.stop()
  }).toThrow()
})
