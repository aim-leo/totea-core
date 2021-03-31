const { Server, Controller, Get } = require('../../index')

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
class Service {
  @Get() // GET /root-simple
  rootSimple() {
    return 'ok'
  }
}

const service = new Service()

service.start()
