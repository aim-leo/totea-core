const {
  Server,
  Query,
  Get,
  Put,
  Params,
  Body,
  createHttpError
} = require('../../index')

const { string, object, integer } = require('tegund')

const users = [
  {
    name: 'leo',
    address: 'XXX XXX',
    age: 20
  },
  {
    name: 'tony',
    address: 'XXX XXX',
    age: 21
  }
]

@Server()
class Service {
  /*
  EXAMPLES:

  >>>>> curl "localhost:3000/user" -X GET
  <<<<< {"code":400,"message":"field name validate error, expected a String type, got a [object Undefined]"}

  >>>>> curl "localhost:3000/user?name=leo" -X GET
  <<<<< {"code":200,"result":{"name":"leo","address":"XXX XXX","age":20},"message":"success"}

  >>>>> curl "localhost:3000/user?name=bob" -X GET
  <<<<<< {"code":404,"message":"can not find this user"}
  
  */
  @Get('/user') // GET /user
  @Query(
    // input a tegund object, it will validate req.query, must contain a name field
    object({
      name: string()
    })
  )
  @Query(query => query.name.length > 1, 'name expected a string, length > 1') // you can also provide a function
  findUserByName({ req, query }) {
    console.log(req.method, req.url)
    const user = users.filter(item => item.name === query.name)[0]
    if (user) return user

    throw createHttpError(404, 'can not find this user')
  }

  /* 
  EXAMPLES:
  
  >>>>> curl "localhost:3000/user/" -X PUT
  <<<<< {"code":404,"message":"Not Found"}

  >>>>> curl "localhost:3000/user/leo" -X PUT -H "Content-type: application/json" -d '{"address": "XXXXXX","age": 23}'
  <<<<< {"code":200,"result":{"address":"XXXXXX","age":23,"name":"leo"},"message":"update user success"}
  
  */

  @Put('/user/:name')
  @Params({
    // provide a object, it will auto transform to ObjectT
    name: string()
  })
  @Body({
    address: string().min(3),
    age: integer().min(1)
  })
  modifyUserByName({ params, body }) {
    const index = users.map(item => item.name).indexOf(params.name)
    if (index === -1) {
      throw createHttpError(404, 'can not find this user')
    }

    // update
    body.name = params.name
    users.splice(index, 1, body)

    return {
      result: body,
      message: 'update user success'
    }
  }
}

const service = new Service()

service.start()
