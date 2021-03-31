const { ToteaServer, Get, Controller } = require('../../index')

const Mongone = require('mongone')
const { string, integer, array, object } = require('mongone/type')
const { Crud } = require('@totea/mongone')

const userModel = new Mongone('user', object({
  name: string().min(2).max(10),
  age: integer().min(1),
  favor: array('string')
}))

@Controller('user')
@Crud(userModel)
class UserController {
  @Get('/other')  // GET /user/other
  getJson({ res }) {
    res.json({ data: 1 })
  }

  @Get('/:id')  // overide GET /user/:id
  findUserById({ query, params }) {
    console.log('call new findById method')

    return this.findById({ query, params })
  }
}

const service = new ToteaServer({
  port: 4000,
  controller: [
    UserController
  ],
  onServe() {
    console.log('service is start success')

    // connect to db
    Mongone.connect('mongodb://localhost:27017/test')
  },
  onClose() {
    console.log('service is closed')

    // disconnect
    Mongone.disconnect()
  },
})

service.start()
