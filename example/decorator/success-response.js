const { Server, Get } = require('../../index')

@Server()
class Service {
  @Get('/data')
  getData() {
    return 'ok'  // return a data, success response, got: {"code":200,"result":"ok","message":"OK"}
  }

  @Get('/res')
  resonseBySelf({ res }) {
    res.json({ code: 200 })  // response by youself, got {"code":200}
  }
}

const service = new Service()

service.start()
