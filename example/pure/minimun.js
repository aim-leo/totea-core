const { ToteaServer } = require('../../index')

const service = new ToteaServer()

service.start()

module.exports = service