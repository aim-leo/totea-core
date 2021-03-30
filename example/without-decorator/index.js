const { ToteaServer, express } = require('../../index')

const router = new express.Router()

router.get(
  '/route',
  (req, res) => {
    res.json({ code: 200 })
  }
)


class Service extends ToteaServer {
  constructor() {
    super()
    
    // GET /root
    this.get('/root', (req, res) => {
      res.json({ code: 200 })
    })

    // POST /root
    this.post('/root', (req, res) => {
      res.json({ code: 200 })
    })

    // DELETE /root
    this.delete('/root', (req, res) => {
      res.json({ code: 200 })
    })

    // PUT /root
    this.put('/root', (req, res) => {
      res.json({ code: 200 })
    })

    // child route
    this.use('/child', router)
  }
}

const service = new Service()
service.start()