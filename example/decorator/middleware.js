const {
  Server,
  Query,
  Get,
  Middleware
} = require('../../index')

const { string, object } = require('tegund')

/* 
EXAMPLES:

  >>>>> curl "localhost:3000/user" -X GET
  <<<<< logs:
    call middleware J
    call middleware K
    call middleware A
    call middleware B
    call middleware C
    call middleware D


  >>>>> curl "localhost:3000/user?name=leo" -X GET
  <<<<< logs:
    call middleware J
    call middleware K
    call middleware A
    call middleware B
    call middleware C
    call middleware D
    call query validator
    call middleware E
    call middleware F
 */

@Server({
  middleware: [
    // it will be overide by middleware J K
    (req, res, next) => {
      console.log('call middleware G')
      next()
    },
    (req, res, next) => {
      console.log('call middleware H')
      next()
    }
  ]
})
@Middleware((req, res, next) => {
  console.log('call middleware A')
  next()
})
@Middleware((req, res, next) => {
  console.log('call middleware B')
  next()
})
class Service {
  @Middleware((req, res, next) => {
    console.log('call middleware C')
    next()
  })
  @Middleware((req, res, next) => {
    console.log('call middleware D')
    next()
  })
  @Get('/user') // GET /user
  @Query(   // if query.name is not a string, can not pass this middleware
    object({
      name: string()
    })
  )
  @Query(() => {
    console.log('call query validator')
    return true
  })
  @Middleware((req, res, next) => {
    console.log('call middleware E')
    next()
  })
  @Middleware((req, res, next) => {
    console.log('call middleware F')
    next()
  })
  findUserByName() {
    return { result: {}, status: 200 }
  }
}

const service = new Service({
  middleware: [
    (req, res, next) => {
      console.log('call middleware J')
      next()
    },
    (req, res, next) => {
      console.log('call middleware K')
      next()
    }
  ]
})

service.start()
