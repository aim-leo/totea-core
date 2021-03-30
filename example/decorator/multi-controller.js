const { Server, Controller, Get } = require('../../index')

@Controller('childOne')
class ChildOneController {
  @Get('/address') // GET /child-one/address
  getData() {
    return 'childOne'
  }
}

@Controller('childTwo')
class ChildTwoController {
  @Get('/address') // GET /child-two/address
  getData() {
    // run other controller's method
    const childOneRes = this.controllers.childOne.getData()

    // run root server's method
    const rootRes = this.server.rootSimple()
    
    return rootRes + '/' + childOneRes
  }
}

@Server({
  controller: [ChildOneController, ChildTwoController]
})
class Service {
  @Get() // GET /root-simple
  rootSimple() {
    return 'root'
  }
}

const service = new Service()

service.start()
