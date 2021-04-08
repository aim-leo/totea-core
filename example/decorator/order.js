const { Server, Get } = require('../../index')

@Server()
class Service {
  @Get('/:id')
  getUserById({ res, params }) {
    res.json({ id: params.id })
  }

  @Get('/user')
  getUser({ res }) {
    res.json({ user: 'leo' })
  }
}

const service = new Service()

service.start()
