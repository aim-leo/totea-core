const { Middleware } = require('../../decorator')
const { Server, Controller, Get, Logger } = require('../../index')

@Controller('childRoute')
class ChildController {
  @Get('/address') // GET /child-route/address
  getData() {
    return 'ok'
  }

  @Get(/ane/) // GET /child-route/address
  getAdd() {
    return 'ok2'
  }
}

@Server({
  controller: [ChildController]
})
@Logger()
class Service {
  @Get() // GET /root-simple
  rootSimple() {
    return 'ok'
  }
}

const service = new Service()

service.start()
