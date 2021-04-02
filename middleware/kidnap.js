const { kidnap } = require('../helper')

const kidnapResSendKey = Symbol()

function kidnapRes(req, res, next) {
  kidnap(res, 'sendFile', (val) => {
    res[kidnapResSendKey] = val
  })

  kidnap(res, 'send', (val) => {
    res[kidnapResSendKey] = val
  })

  next()
}

module.exports = {
  kidnapRes,
  kidnapResSendKey
}