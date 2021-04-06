const { Server, Post } = require('../../index')

@Server()
class Service {
  @Post('/all_arg')
  getData({ res, req, next, headers, query, body, params  }) {

  }
}

const service = new Service()

service.start()
