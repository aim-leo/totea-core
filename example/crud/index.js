const { Server, Get, Post, Delete, Put, Query } = require('../../index')

// mock db
const users = [] // eg { id: 1, name: 'leo' }
// mock user.id self increasing
let lastCreateUserId = 0

@Server()
class Service {
  @Get('/user')
  getUser() {
    return users
  }

  @Get('/user/:id')
  getUserById({ params }) {
    if (!params.id) {
      return Promise.reject('please input user id')
    }
    const user = users.filter(item => item.id === parseInt(params.id))[0]

    if (!user) {
      return Promise.reject('this user is unexsist, please recheck')
    }

    return user
  }

  @Post('/user')
  insertUser({ body }) {
    if (!body.name) {
      return Promise.reject('please input a user name')
    }
    const user = users.filter(item => item.name === body.name)[0]

    if (user) {
      return Promise.reject('this user is created, please recheck')
    }

    // insert to db
    lastCreateUserId++
    const insertItem = {
      id: lastCreateUserId,
      name: body.name
    }
    users.push(insertItem)

    return insertItem
  }

  @Delete('/user/:id')
  deleteUserById({ params }) {
    if (!params.id) {
      return Promise.reject('please input user id')
    }
    const userIndex = users.map(item => item.id).indexOf(parseInt(params.id))

    if (userIndex === -1) {
      return Promise.reject('this user is unexsist, please recheck')
    }

    //delete
    const deleteItem = users.splice(userIndex, 1)[0]

    return deleteItem
  }

  @Put('/user/:id')
  modifyUserById({ params, body }) {
    if (!params.id) {
      return Promise.reject('please input user id')
    }
    const userIndex = users.map(item => item.id).indexOf(parseInt(params.id))

    if (userIndex === -1) {
      return Promise.reject('this user is unexsist, please recheck')
    }

    if (!body.name) {
      return Promise.reject('please input a user name')
    }

    // update
    const updateItem = {
      ...users[userIndex],
      name: body.name
    }
    users.splice(userIndex, 1, updateItem)[0]

    return updateItem
  }
}

const service = new Service()

service.start()

// >>>>> curl "localhost:3000/user" -X GET
// <<<<< {"status":200,"result":[],"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X GET
// <<<<< {"status":400,"message":"this user is unexsist, please recheck"}

// >>>>> curl "localhost:3000/user" -X POST
// <<<<< {"status":400,"message":"please input a user name"}

// >>>>> curl "localhost:3000/user" -X POST -H "Content-type: application/json" -d '{"name": "leo"}'
// <<<<< {"status":200,"result":{"id":1,"name":"leo"},"message":"OK"}

// >>>>> curl "localhost:3000/user" -X POST -H "Content-type: application/json" -d '{"name": "leo"}'
// <<<<< {"status":400,"message":"this user is created, please recheck"}

// >>>>> curl "localhost:3000/user" -X POST -H "Content-type: application/json" -d '{"name": "tony"}'
// <<<<< {"status":200,"result":{"id":2,"name":"tony"},"message":"OK"}

// >>>>> curl "localhost:3000/user" -X GET
// <<<<< {"status":200,"result":[{"id":1,"name":"leo"},{"id":2,"name":"tony"}],"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X GET
// <<<<< {"status":200,"result":{"id":1,"name":"leo"},"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X DELETE
// <<<<< {"status":200,"result":{"id":1,"name":"leo"},"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X GET
// <<<<< {"status":400,"message":"this user is unexsist, please recheck"}

// >>>>> curl "localhost:3000/user/2" -X PUT -H "Content-type: application/json" -d '{"name": "tom"}'
// <<<<< {"status":200,"result":{"id":2,"name":"tom"},"message":"OK"}

// >>>>> curl "localhost:3000/user" -X GET
// <<<<< {"status":200,"result":[{"id":2,"name":"tom"}],"message":"OK"}