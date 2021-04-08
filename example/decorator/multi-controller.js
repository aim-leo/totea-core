const { Server, Controller, Get } = require('../../index')

@Controller('childOne')
class ChildOneController {
  @Get('/address') // GET /child-one/address
  getAlias() {
    return 'childOne'
  }
}

@Controller('childTwo')
class ChildTwoController {
  @Get('/address') // GET /child-two/address
  getAlias() {
    // run other controller's method
    const childOneRes = this.controllers.childOne.getAlias()

    // run root server's method
    const rootRes = this.server.getRootAlias()
    
    return rootRes + '/' + childOneRes
  }
}

@Server({
  controller: [ChildOneController, ChildTwoController]
})
class Service {
  @Get() // GET /root
  root() {
    return 'get/' + this.controllers.childTwo.getAlias()
  }

  getRootAlias() {
    return 'root'
  }
}

const service = new Service()

service.start()
