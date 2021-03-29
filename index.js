const decorator = require('./decorator')

const { Server } = decorator

@Server()
class ToteaServer {}

module.exports = {
  ToteaServer,

  ...decorator
}
