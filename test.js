const express = require('express')
const app = express()
const port = 3000

app.use((req, res, next) => {
  console.log('call global middleware')

  next()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const router = new express.Router()

router.get('/', (req, res) => {
  res.send('Hello Router!')
})

app.use('/child', router)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})