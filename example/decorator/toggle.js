const { Server } = require('../../index')

@Server({
  onServe() {
    console.log('on serve')
  },
  onClose() {
    console.log('on close')
  }
})
class Service {}

const service = new Service()
// start sevice
service.start()
// after 5s, close it
setTimeout(() => {
  service.stop()
}, 5000)
// start it again
setTimeout(() => {
  service.start()
}, 10000)