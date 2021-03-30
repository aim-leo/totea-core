const { Server } = require('../../index')

@Server()
class Service {}

const service = new Service()

service.start()