const express = require('express')
const http = require('http')

const app = express()
app.set('port', 5000)

const middlewareOne = (req, res, next) => {
  console.log('call middleware 1')

  next()
}

const middlewareTwo = (req, res, next) => {
  console.log('call middleware 2')

  next()
}

app.get('/res', middlewareOne, middlewareTwo, (req, res) => {
  res.json({ status: 200 })
})

const server = http.createServer(app)

server.listen(5000)
