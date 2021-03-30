function kidnap(targetObj, methodName, kidnapMethod) {
  const oldMethod = targetObj[methodName]

  if (typeof oldMethod !== 'function') {
    throw new Error(`${methodName} expected a function`)
  }

  if (typeof kidnapMethod !== 'function') {
    throw new Error(`kidnap method expected a function`)
  }

  const newFunction = function (...args) {
    oldMethod.call(targetObj, ...args)
    kidnapMethod(...args)
  }

  targetObj[methodName] = newFunction

  return newFunction
}

module.exports = {
  kidnap
}
