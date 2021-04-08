const { Server, Override, Get } = require('../../index')

@Server()
class Service {
  @Get('/user') // GET /user
  getUser() {
    return { id: 1, name: 'leo' }
  }

  @Get('/user') // GET /user
  @Override()
  getUser2() {
    return { id: 2, name: 'tony' }
  }
}

const service = new Service()

service.start()
