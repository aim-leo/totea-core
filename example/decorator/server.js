const { Server } = require('../../index')

@Server({
  port: 4000,
  onServe() {
    console.log('service is start success')
  },
  onClose() {
    console.log('service is closed')
  },
  engine: 'html',
  view: './view',
  errorMiddleware: [],
  controller: [],
  middleware: []
})
class Service {}

const service = new Service()

service.start()