<p align="center">
  <img width="320" :src="$withBase('/logo.svg')">
</p>

<h3 align="center">
  Use decorators and javascript to build web services
</h3>

<br/>
<br/>
<br/>

English | [简体中文](./README.zh-CN.md)

## Introduction

**totea** is a nodejs framework based on express, using decorators to define routing and middleware. Features overview:

- **javascript**: Existing frameworks that use decorators all use typescript by default, totea can be used in javascript, only need to introduce [plugin-proposal-decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators);
- **Simple and efficient**: totea provides less than 20 decorator functions, but it can support a variety of complex usage scenarios;
- **Easy to integrate**: Totea uses express as a web server. We have not modified any underlying logic, which means that the methods and plugins that can be used in express can also be used in totea.

---

## Example

### Minimal example

```javascript
const { Server } = require('@totea/core')

@Server()
class Service {}

const service = new Service()

service.start() // the app will serve at localhost:3000
```

### Define routing

```javascript
const { Server, Get, Post, Delete, Put, Patch } = require('@totea/core')

@Server()
class Service {
  @Get('/root')
  getRoot() {
    return 1
  }

  @Post('/root')
  postRoot() {
    return 1
  }

  @Delete('/root')
  deleteRoot() {
    return 1
  }

  @Patch('/root')
  patchRoot() {
    return 1
  }

  @Put('/root')
  putRoot() {
    return 1
  }
}

const service = new Service()

service.start()
```

### Use middleware

```javascript
const { Server, Get, Middleware } = require('@totea/core')

@Server()
@Middleware((req, res, next) => {
  // global middleware
  console.log('call global middleware')
  next()
})
class Service {
  @Get('/root')
  @Middleware((req, res, next) => {
    // Private middleware
    console.log('call specific middleware')
    next()
  })
  getRoot() {
    return 1
  }
}

const service = new Service()

service.start()
```

### Parameter verification

```javascript
const { Server, Get, Query } = require('@totea/core')

@Server()
class Service {
  @Get('/root')
  @Query(query => query.id && quey.id.length === 10) // The id field must be included in req.query, the length is 10, otherwise it returns 400
  getRoot() {
    return 1
  }
}

const service = new Service()

service.start()

// >>>>> curl "localhost:3000/root" -X GET
// <<<<< {"status":400,"message":"Bad Request"}

// >>>>> curl "localhost:3000/root?id=1" -X GET
// <<<<< {"status":400,"message":"Bad Request"}

// >>>>> curl "localhost:3000/root?id=1234567890" -X GET
// <<<<< {"status":200,"message":"OK", "result": 1}
```

### Sub-route

```javascript
const { Server, Get, Query, Controller } = require('@totea/core')

// use controller define a sub-route
@Controller('childRoute')
class ChildController {
  @Get('/address') // GET /child-route/address
  getAddress() {
    return 'ok'
  }
}

// then provide it to server
@Server({
  controller: [ChildController]
})
class Service {}

const service = new Service()

service.start()

// >>>>> curl "localhost:3000/child-route/address" -X GET
// <<<<< {"status":200,"message":"OK", "result":'ok'}
```

## Installation and use

```bash
# install totea
npm i @totea/core

# Install and configure babel
npm i @babel/core @babel/node @babel/plugin-proposal-decorators

# If there is already a babel configuration, add a decorator plugin
# If not, create a babel configuration file in the project root directory and write the following:
module.exports = {
  plugins: [
    ["@babel/plugin-proposal-decorators", {legacy: true }]
  ],
};

# Use babel-node to run and debug your code
npx babel-node index.js
```

## API

### Server

```javascript
const { Server } = require('@totea/core')
```

#### Parameters

The **Server** decorator is used to define a web server and contains the following parameters:

- **port**: The port on which the service runs, `integer`, default 3000, acceptable port range: 1024-65535;
- **middleware**: global middleware, `array<function>`, the type is an array containing one or more functions;
- **errorMiddleware**: global error handling middleware, `array<function>`, the type is an array containing one or more functions;
- **controller**: The secondary routing list, `array<Controller|controller>`, which can provide Controller or an array of controllers that have been instantiated;
- **onServe**: The hook function for the service to start running, `function`;
- **onClose**: The hook function when the service ends, `function`;
- **onResponse**: The callback function before the request response, which can be used to customize the response format, `function`;
- **slience**: Whether to prohibit printing log, `boolean`, default false;
- **static**: Define static file directory, `string|{path: string, maxAge: integer}`, can accept string type, which means directory, or an obejct, the parameter will be automatically passed to express.static()
- **view**: Define the view rendering template,
  \-path: template folder, `string`, eg:'./views'
  \-engine: template engine, `object`, the provided value needs to include the `__express` attribute, eg: require('pug')
  \-type: template engine name, `string`, eg:'pug'

#### example

```javascript
const { Server, Get, Query, Controller } = require('@totea/core')

@Controller('childRouteA')
class ChildControllerA {}

@Controller('childRouteB')
class ChildControllerB {}

@Server({
  port: 4000,
  onServe() {
    console.log('service is start success')
  },
  onClose() {
    console.log('service is closed')
  },
  errorMiddleware: [
    (error, req, res, next) => {
      console.error('got a error', error)
      next(error)
    }
  ],
  middleware: [
    (req, res, next) => {
      console.log('call global middleware')
      next()
    }
  ],
  controller: [ChildControllerA, ChildControllerB],
  static: './public',
  view: {
    path: './views',
    engine: require('pug'),
    type: 'pug'
  },
  slience: true
})
class Service {}

// You can also pass parameters when instantiating, the parameters here will be merged to cover the part that has been passed in the decorator
const service = new Service({
  slience: false
})

service.start()
```

### ToteaServer

**ToteaServer** The class obtained after the Server decorator wraps, can also be directly quoted from totea:

```javascript
const { ToteaServer } = require('@totea/core')

const service = new ToteaServer()

service.start()

// The above example is equivalent to
const { Server } = require('@totea/core')

@Server()
class ToteaServer {}

const service = new ToteaServer()

service.start()
```

#### Instance attributes

- **app**: the express instance created;
- **server**: the created http server;
- **runing**: Get the current service running status, true means it is running;

#### Example method

- **start()**: Start running the server;
- **stop()**: Stop running the server;
- **status()**: Get the current service running status, true means it is running;
- **useController(`Controller|controller`)**: Inject a secondary route, which can provide a Controller or an instantiated controller;
- **use()**: equivalent to app.use in express;
- **all()**: equivalent to app.all in express;
- **get()**: equivalent to app.get in express;
- **post()**: equivalent to app.post in express;
- **patch()**: equivalent to app.patch in express;
- **delete()**: equivalent to app.delete in express;
- **put()**: equivalent to app.put in express;

### Controller

```javascript
const { Controller } = require('@totea/core')
```

#### Parameters

The **Controller** decorator is used to define secondary routes and contains the following parameters:

- **name**: controller name, `string`, cannot contain `/` characters, we will use [humps](https://www.npmjs.com/package/humps) to format and convert the name by default In camel case format, the bound routing path will be converted to lowercase characters and connected with-

  | Input                                                                    | Name(`camelize`) | Path(`decamelize, separator: -`) |
  | :----------------------------------------------------------------------- | :--------------: | -------------------------------: |
  | @Controller(``hello-world_route') | helloWorldRoute | /hello-world-route |
  | @Controller(''Phone')                                                    |      phone       |                           /phone |
  | @Controller('/SubRoute')                                                 |     subRoute     |                       /sub-route |

#### example

The following example demonstrates how to obtain a controller instance in the server or each controller through `this.controllers.${controllerName}`. In addition, in each controller, the server instance can be obtained through `this.server`. This greatly facilitates code reuse:

```javascript
const { Server, Controller, Get } = require('../../index')

@Controller('childOne')
class ChildOneController {
  @Get('/address') // GET /child-one/address
  getAlias() {
    return 'childOne'
  }
}

@Controller('child-two')
class ChildTwoController {
  @Get('/address') // GET /child-two/address
  getAlias() {
    // run other controller's method
    const childOneRes = this.controllers.childOne.getAlias()

    // run root server's method
    const rootRes = this.server.getRootAlias()

    return rootRes + '/' + childOneRes
  }
}

@Server({
  controller: [ChildOneController, ChildTwoController]
})
class Service {
  @Get() // GET /root
  root() {
    return 'get/' + this.controllers.childTwo.getAlias()
  }

  getRootAlias() {
    return 'root'
  }
}

const service = new Service()

service.start()

// >>>>> curl "localhost:3000/root"
// <<<<< {"status":200,"result":"get/root/childOne","message":"OK"}
```

### ToteaController

**ToteaController** The class obtained after the Controller decorator wraps, can also be directly referenced from totea:

How to write without decorators

```javascript
const { ToteaServer, ToteaController } = require('@totea/core')

const controller = new ToteaController('child')

const service = new ToteaServer({
  controller: [controller]
})

service.start()
```

The above example is equivalent to

```javascript
const { Server, Controller } = require('@totea/core')

@Controller('child')
class ToteaController {}

@Server()
class ToteaServer {}

const service = new ToteaServer({
  controller: [ToteaController]
})

service.start()
```

#### Instance attributes

- **router**: Router instance created by the controller;
- **url**: The url address bound to the controller;
- **name**: the name of the controller;

#### Example method

- **getRouter()**: Return the Router instance created by the controller;
- **use()**: equivalent to router.use of the controller;
- **all()**: equivalent to router.all of the controller;
- **get()**: equivalent to router.get of the controller;
- **post()**: equivalent to router.post of the controller;
- **patch()**: equivalent to the router.patch of the controller;
- **delete()**: equivalent to router.delete of the controller;
- **put()**: equivalent to router.put of the controller;

> It can be seen that the Server decorator is actually a Controler decorator. They have basically the same methods. The difference is that in the Server, calling methods such as `use | all | get` will bind the route to the app, but in the controller , Is bound to the internal router. In express, the app is a special router, isn't it?

Reading the following documents, you can find that the concept in totea is very simple, it provides a basically consistent API and as few decorator methods as possible, which is very easy for developers to master.

### Methods

**Methods** decorator is used to add routing binding to Server or Controller, including the following:

- **Get**: bind get request
- **Post**: bind postt request
- **Delete**: bind delete request
- **Patch**: bind patch request
- **Put**: bind put request

Parameters: Indicates the bound routing address, which is the same as the address in express, `string|regexp`, supports string or regular expression, optional, if the parameter is omitted, the bound function name will be used as the address.

#### Examples of errors

> Note: The same url and method cannot be bound to different functions, and different urls cannot be bound to the same function. They must correspond one-to-one. Totea can check most error scenarios, but there are some Developers need to be standardized from coding.

```javascript
@Server()
class Service {
  @Get('/user')
  getUser() {
    return {id: 1, name:'leo'}
  }

  @Get('/user') // ERROR, can not bind /user again
  getUser2() {
    return {id: 2, name:'tony'}
  }
}

// will get a Error
Error: the url: /user has already bound
```

```javascript
@Server()
class Service {
  @Get('/user')
  getUser() {
    return {id: 1, name:'leo'}
  }

  @Get('/user2')
  getUser() {// ERROR, can not bind /user2 to getUser
    return {id: 2, name:'tony'}
  }
}
// will get a Error
Error: the callback:getUser has already bound to url: /user, method: get
```

#### Situations to avoid

> The following example will not report an error. It seems that it is not wrong to define two same methods in the same class, but we strongly do not recommend this, which will make the code logic very confusing.

```javascript
@Server()
class Service {
  @Get('/user')
  getUser() {
    return { id: 1, name: 'leo' }
  }

  getUser() {
    // RIGHT, but not recommand
    return { id: 2, name: 'tony' }
  }
}
```

#### RESTful

> The same URL can be bound to different functions, provided that different methods are used, such as @Get('/user') @Post('/user') can be bound to different methods respectively, which is often used to create RESTful style Api.

The following example demonstrates the use of totea to create a restful style api interface:

```javascript
const { Server, Get, Post, Delete, Put } = require('@totea/core')

// mock db
const users = [] // eg {id: 1, name:'leo'}
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

// >>>>> curl "localhost:3000/user" -X POST -H "Content-type: application/json" -d'{"name": "leo"}'
// <<<<< {"status":200,"result":{"id":1,"name":"leo"},"message":"OK"}

// >>>>> curl "localhost:3000/user" -X POST -H "Content-type: application/json" -d'{"name": "leo"}'
// <<<<< {"status":400,"message":"this user is created, please recheck"}

// >>>>> curl "localhost:3000/user" -X POST -H "Content-type: application/json" -d'{"name": "tony"}'
// <<<<< {"status":200,"result":{"id":2,"name":"tony"},"message":"OK"}

// >>>>> curl "localhost:3000/user" -X GET
// <<<<< {"status":200,"result":[{"id":1,"name":"leo"},{"id":2,"name":"tony"} ],"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X GET
// <<<<< {"status":200,"result":{"id":1,"name":"leo"},"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X DELETE
// <<<<< {"status":200,"result":{"id":1,"name":"leo"},"message":"OK"}

// >>>>> curl "localhost:3000/user/1" -X GET
// <<<<< {"status":400,"message":"this user is unexsist, please recheck"}

// >>>>> curl "localhost:3000/user/2" -X PUT -H "Content-type: application/json" -d'{"name": "tom"}'
// <<<<< {"status":200,"result":{"id":2,"name":"tom"},"message":"OK"}

// >>>>> curl "localhost:3000/user" -X GET
// <<<<< {"status":200,"result":[{"id":2,"name":"tom"}],"message":"OK"}
```

#### Binding method

When this method is bound to the specified route, the corresponding request will be responded to by this method, and the context of each request will be injected in the form of parameters. All parameters:

- **req**: context.req
- **res**: context.res
- **next**: context.next
- **query**: context.req.query
- **body**: context.req.body
- **headers**: context.req.headers
- **params**: context.req.params
  All parameters will be injected into a context object and injected into the first parameter of the method.

```javascript
@Server()
class Service {
  @Post('/all_arg')
  getData({ res, req, next, headers, query, body, params }) {
    // response with res.json
    res.json({ status: 2000, message: 'OK' })
  }
}
```

### Paramters

**Paramters** decorator is used to add parameter filters to the request, including the following:

- **Body** body filter
- **Query** query filter
- **Params** params filter
- **Headers** headers filter

#### Validator

The first parameter represents the validator, `required`, which supports the following types:

- The `function` parameter is the corresponding request content, please see the example:

```javascript
const { Server, Get, Query, Body } = require('@totea/core')

@Server()
class Service {
  @Get()
  @Query(query => query.id && query.id.length === 10) // When req.query.id exists and the length is 10, it returns true, indicating that the verification passed, and if it fails, you will receive {status : 400, message: "Bad Request"}
  @Body(body => {
    // Return string format, indicating error message, you will receive {status: 400, message: "please provide a name"}
    if (!body.name) return 'please provide a name'
    // No return or return true, indicating that the test passed
  })
  @Params(params => {
    // Return Error, indicating that http error will receive {status: 400, message: error.message"}
    if (!params.address) return new Error()
  })
  @Headers(headers => {
    // Return number format, which means http error status, you will receive {status: 401, message: "Unauthorized"}
    if (!headers.token) return 401
  })
  getData() {}
}
```

- `tegund.ObjectT` is an object created by [tegund](https://www.npmjs.com/package/tegund)

Tegund is used extensively in totea as a dynamic parameter verification tool, which is also very useful in regular request parameter verification.

In addition, the totea framework itself depends on tegund, which means that you don’t need to install it separately, you can quote it directly, please see the example:

```javascript
const { object, string, integer } = require('tegund')
const { Server, Body, Query, Body } = require('@totea/core')

@Server()
class Service {
  @Get()
  @Body(
    object({
      name: string()
        .min(2)
        .max(10), // req.body.name must be a string and the length is 2-10
      age: integer().min(0) // req.body.age must be a non-negative integer
    })
  )
  getData() {}
}
```

tegund will verify the parameters and return the corresponding error message when the verification fails. You only need to provide a suitable verifier.

You can even omit object and directly:

```javascript
@Body({
  name: string().min(2).max(10),
  age: integer().min(0)
})
```

For simpler cases, you can even do this:

```javascript
@Body({
  name:'string',
  age:'integer'
})
```

For more information, please refer to [tegund documentation](https://www.npmjs.com/package/tegund)

#### Default error message

The second parameter is used to specify a default error message, `optional`, `string` type

```javascript
const { Server, Get, Query, Body } = require('@totea/core')

@Server()
class Service {
  @Get()
  // If you fail, you will receive {status: 400, message: "expected a string id, length = 10"}
  @Query(
    query => query.id && query.id.length === 10,
    'expected a string id, length = 10'
  )
  getData() {}
}
```

The `priority` of the error message is the error message returned by the validator> the default error message specified by the second parameter> the error message corresponding to httpError (400 if it is not specified).

The source code is as follows:

```javascript
// result represents the return value of the validator errorMessage represents the default error message provided
if (result === false) {
  throw createHttpError(400, errorMessage)
}

if (result instanceof Error) {
  throw createHttpError(400, result.message || errorMessage)
}

if (typeof result === 'string') {
  throw createHttpError(400, result || errorMessage)
}

if (typeof result === 'number') {
  throw createHttpError(result, errorMessage)
}
```

### Middleware

**Middleware** decorator is used to add global middleware to Server and Controller, or to add separate middleware to a request.

> Middleware is the core of express, which is also important in totea. You may have discovered that the Paramters parameter validator mentioned above is actually a special kind of middleware, isn't it?

#### Global Middleware

```javascript
const { Server, Middleware } = require('@totea/core')

@Server()
@Middleware((req, req, next) => {
  // The first global middleware
  console.log('call first global middleware of service')
  next()
})
@Middleware((req, req, next) => {
  // Add another global middleware, which will be executed after the first middleware is executed
  console.log('call second global middleware of service')
  next()
})
class ToteaServer {}
```

You can also add to the controller:

```javascript
const { Controller, Middleware } = require('@totea/core')

@Controller('child')
@Middleware((req, req, next) => {
  // The first sub-route global middleware
  console.log('call first global middleware of service')
  next()
})
@Middleware((req, req, next) => {
  // Add another sub-route global middleware, which will be executed after the first middleware is executed
  console.log('call second global middleware of service')
  next()
})
class ChildController {}
```

#### Private middleware

You can add private middleware to a single route:

```javascript
const { Server, Middleware } = require('@totea/core')

@Server()
class ToteaServer {
  @Get('/user')
  @Middleware((req, req, next) => {
    // The first private middleware
    console.log('call first middleware of /user')
    next()
  })
  @Middleware((req, req, next) => {
    // Add another private middleware, which will be executed after the first middleware is executed
    console.log('call second middleware of /user')
    next()
  })
  getUser() {}
}
```

#### Using Express middleware

As we said, totea uses express as a web server, we have not modified any underlying logic, which means that all middleware developed for Express can be used directly

Example, use morgan to print the request log:

```javascript
const { Server, Middleware } = require('@totea/core')
const morgan = require('morgan')

@Server()
@Middleware(morgan('combined'))
class ToteaServer {}
```

#### Built-in log middleware

Of course, totea also comes with a simple log printing middleware, how to use it:

```javascript
const {Server, Logger, Get} = require('@totea/core')
const morgan = require('morgan')

@Server()
@Logger()
class Service{
  @Get('/user')
  getUser() {
    return {
      result: {"docs":[],"count":0,"page":1,"limit":10},
      message:'user query success!'
    }
  }
}

// logs
[totea logger]: 2021-04-07T09:43:18.836Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1," limit":10},"message":"user query success!"} 11ms

[totea logger]: 2021-04-07T09:45:07.921Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1," limit":10},"message":"user query success!"} 3ms

[totea logger]: 2021-04-07T09:45:08.684Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1," limit":10},"message":"user query success!"} 1ms

[totea logger]: 2021-04-07T09:45:09.346Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1," limit":10},"message":"user query success!"} 1ms
```

## Successful response

In express, generally use req.send or res.json to respond to requests. This method is also applicable in totea:

```javascript
@Server()
class Service {
  @Get('/user')
  getUser({ res }) {
    res.status(200).json({ status: 200, message: 'OK' })
  }

  @Get('/page')
  getPage({ res }) {
    res.send('<p>some html</p>')
  }

  @Get('/html')
  getPage({ res }) {
    res.sendFile('test.html', { root: 'pages' })
  }
}
```

In totea, we have a more convenient way to return json, just put the content in the return value of the function.
For requests other than json, the res method still needs to be used to respond.

> Note that when the function does not return a value, or returns undefined (which cannot be distinguished in the actual code), totea will treat the request as a correct response and return {status: 500, message: "Internal Server Error"}

```javascript
@Server()
class Service{
@Get('/user')
getUser() {// The returned content will be wrapped in the form of {status: 200, message: "OK", result: ${return}}
return {name:'leo', address:'XXX'}
}

@Get('/json')
getPage() {
// Assuming the return is an obejct, and has an integer type status, or there is a message with a non-empty string format, return the json
return {
status: 200,
result: {name:'leo', address:'XXX' },
message:'OK'
}
}
}

// Both of the above two requests will return the same content:
{
status: 200,
result: {name:'leo', address:'XXX' },
message:'OK'
}
```

> totea hijacks the sendFile and send methods of res in order to obtain the expected return content before requesting a response. At the same time, we have also avoided the problem of repeated responses to requests.

In the following example, after the request is responded to by res.json, although the code will continue to run down, it will not respond repeatedly. Of course, it is a good coding practice to return in time.

```javascript
@Server()
class Service {
  @Get('/user')
  getUser({ res, query }) {
    if (!query.id) {
      res.json({ status: 404, message: 'please provide a user id' })
    }
    return { name: 'leo', address: 'XXX' }
  }
}
```

## Failed response

Compared with a successful response, in actual coding, the interface returns an error situation is more common, totea provides a variety of ways to deal with:

> Use [http-errors](https://www.npmjs.com/package/http-errors) in totea to create httpError, you can import the library directly, or use the createHttpError method directly.

```javascript
const { Server, Get, createHttpError } = require('@totea/core')
@Server()
class Service {
  // response by res, got: {"status":401,"message":"Unauthorized"}
  @Get('/error_res')
  errorRes({ res }) {
    res.json({ status: 401, message: 'Unauthorized' })
  }

  // return a Promise.reject, with a http status, got: {"status":404,"message":"Not Found"}
  @Get('/error_status')
  errorstatus() {
    return Promise.reject(404)
  }

  // return a Promise.reject, with a error message, got: {"status":400,"message":"this is the invalid message"}
  @Get('/error_message')
  errorMessage() {
    return Promise.reject('this is the invalid message')
  }

  // return a Promise.reject, with http status and message, got: {"status":410,"message":"this is the invalid message"}
  @Get('/error_status_message')
  errorstatusAndMessage() {
    return Promise.reject({
      status: 410,
      message: 'this is the invalid message'
    })
  }

  // return a http error, got: {"status":401,"message":"Unauthorized"}
  @Get('/http_error')
  httpError() {
    return createHttpError(401)
  }

  // throw a http error, got: {"status":401,"message":"Unauthorized"}
  @Get('/http_error')
  throwHttpError() {
    throw createHttpError(401)
  }

  // return a normal error, got {"status":406,"message":"this is a error message"}
  @Get('/return_simple_error')
  returnSimpleError() {
    const e = new Error('this is a error message')

    e.status = 406

    return e
  }

  // throw a normal error, got {"status":406,"message":"this is a error message"}
  @Get('/throw_simple_error')
  throwSimpleError() {
    const e = new Error('this is a error message')

    e.status = 406

    throw e
  }
}
```

> Express does not provide a global error handling method. It is particularly difficult to intercept exceptions thrown by async/await. Totea uses [express-async-errors](https://www.npmjs.com/package/express-async- errors), when an unknown error is intercepted, a {status: 500, message: "Internal Server Error"} is always returned.

## Route priority

Express itself does not provide routing priority ordering, the order of routing depends on your code order. When using express native methods to define routes, your app may have inaccessible dead zones:

```javascript
const express = require('express')

const app = express()

app.get('/:id', (req, res) => {
  // All requests are responded here
  res.json({ id: req.params.id })
})

app.get('/user', (req, res) => {
  // dead zone
  res.json({ user: 'leo' })
})

app.listen(3000)
```

This is inconsistent with what we expected. We hope that specific routes will match first, followed by matching routes.

There is no need to worry about this situation in totea. We use [sort-route-addresses](https://www.npmjs.com/package/sort-route-addresses) to sort the priority of routes by default:

```javascript
const { Server, Get } = require('@totea/core')

@Server()
class Service {
  @Get('/:id')
  getUserById({ res, params }) {
    res.json({ id: params.id })
  }

  @Get('/user')
  getUser({ res }) {
    res.json({ user: 'leo' })
  }
}

const service = new Service()

service.start()
```

This example is exactly the same as above, but meets the requirements.

## HTTP status code

The original intention of totea is to create an API server, and it will be very efficient to use it to write interfaces.

In the actual development process, our interface may be required to always return data with a 200 status code, and the actual status information is reflected in the returned json.
For example, a client development engineer may ask you to design an interface like this:

```javascript
// When the request is successful
Status status: 200 OK
response: {status: 200, message: "OK", result: [{ name:'leo' }]}
// When there is an error in the request, such as insufficient permissions
Status status: 200 OK
response: {status: 401, message: "Unauthorized"}
```

It must be said that this is also a norm, but it is contrary to mainstream design ideas, such as RESTful:

```javascript
// When the request is successful
Status status: 200 OK
response: {result: [{ name:'leo' }]}
// When there is an error in the request, such as insufficient permissions
Status status: 401 Unauthorized
response: null
```

There have been heated discussions on this issue on V2EX, the original address: [API uses HTTP status code or all return 200](https://www.v2ex.com/t/191534), each developer has different understanding

Totea uses the first specification by default, but allows developers to customize the response. The Server decorator accepts an onResponse method, which will be called before each request is returned. You can provide a custom method to override it.

The default onResponse method is:

```javascript
function onResponse({ res, status, result, message }) {
  res.json(
    removeEmpty(
      {
        // if some arg is undefined, will remove it
        status: status,
        message: message,
        result
      },
      {
        removeNull: false,
        removeUndefined: true
      }
    )
  )
}
```

Suppose you want to use the RESTful specification:

```javascript
@Server({
  onResponse: ({ res, status, result, message }) => {
    res.status(status)
    res.json({ result, message })
  }
})
class Service {}
```

## HTML templates and static directories

For detailed examples, please see [Address](https://github.com/aim-leo/totea-core/tree/master/example/view).

## Similar framework

- `nestjs` [link](https://www.npmjs.com/package/@nestjs/core) nestjs is a large and comprehensive framework with excellent design ideas. It needs to be used with typescript, which is suitable for developing large-scale projects.
- `overnightjs`[link](https://www.npmjs.com/package/@overnightjs/core) The design idea of ​​overnightjs is similar to totea, the difference is that it needs to be used with typescript.
