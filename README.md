# totea

**totea**是一个基于express的nodejs框架，使用装饰器来定义路由和中间件。特点概述:

*   **javascript** : 现有的使用装饰器的框架都默认使用typescript，totea可以在javascript中使用，只需要引入[plugin-proposal-decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)；
*   **简单高效** : totea提供了不到20个装饰器函数，却可以支持多种复杂使用场景；
*   **易于整合** : totea使用express作为web服务器，我们没有修改任何底层的逻辑，这意味着在express中能使用的方法和插件，也可以在totea中使用。

***

## Table of Contents

*   [简单示例](#简单示例)

    *   [最小的示例](#最小的示例)
    *   [定义路由](#定义路由)
    *   [使用中间件](#使用中间件)
    *   [参数校验](#参数校验)
    *   [子路由](#子路由)

*   [安装使用](#安装使用)

*   [API](#api)

    *   [Server](#server)

        *   [参数](#参数)
        *   [example](#example)

    *   [ToteaServer](#toteaserver)

        *   [实例属性](#实例属性)
        *   [实例方法](#实例方法)

    *   [Controller](#controller)

        *   [参数](#参数-1)
        *   [example](#example-1)

    *   [ToteaController](#toteacontroller)

        *   [实例属性](#实例属性-1)
        *   [实例方法](#实例方法-1)

    *   [Methods](#methods)

        *   [错误的例子](#错误的例子)
        *   [应当避免的情况](#应当避免的情况)
        *   [RESTful](#restful)
        *   [绑定后的方法](#绑定后的方法)

    *   [Paramters](#paramters)

        *   [校验器](#校验器)
        *   [默认错误信息](#默认错误信息)

    *   [Middleware](#middleware)

        *   [全局中间件](#全局中间件)
        *   [私有中间件](#私有中间件)
        *   [使用Express中间件](#使用express中间件)
        *   [自带的日志中间件](#自带的日志中间件)

*   [成功响应](#成功响应)

*   [失败响应](#失败响应)

*   [路由优先级](#路由优先级)

*   [HTTP状态码](#http状态码)

*   [HTML模板及静态目录](#html模板及静态目录)

## 简单示例

### 最小的示例

```javascript
const { Server } = require('@totea/core')

@Server()
class Service {}

const service = new Service()

service.start()  // the app will serve at localhost:3000
```

### 定义路由

```javascript
const { Server， Get， Post, Delete, Put, Patch } = require('@totea/core')

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

### 使用中间件

```javascript
const { Server， Get， Middleware } = require('@totea/core')

@Server()
@Middleware((req, res, next) => {  // 全局中间件
	console.log('call global middleware')
	next()
})
class Service {
	@Get('/root')
	@Middleware((req, res, next) => {  // 私有的中间件
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

### 参数校验

```javascript
const { Server， Get， Query } = require('@totea/core')

@Server()
class Service {
	@Get('/root')
	@Query(query => query.id && quey.id.length === 10)  // 必须在req.query中包含id字段，长度为10，否则返回400
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

### 子路由

```javascript
const { Server， Get， Query， Controller } = require('@totea/core')

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
// <<<<< {"status":200,"message":"OK", "result": 'ok'}
```

## 安装使用

```bash
// 安装totea
npm i @totea/core

// 安装配置babel
npm i @babel/core @babel/node @babel/plugin-proposal-decorators

// 如果已经有babel配置，添加decorator插件
// 若没有，在项目根目录新建babel配置文件，写入以下内容:
module.exports = {
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }]
  ],
};

// 使用babel-node运行调试你的代码
npx babel-node index.js
```

## API

### Server

```javascript
const { Server } = require('@totea/core')
```

#### 参数

**Server**装饰器用于定义一个Web服务器，包含以下参数:

*   **port** : 服务运行的端口，`integer`，默认3000，可接受的端口范围:1024-65535；
*   **middleware** : 全局中间件，`array<function>`，类型是包含一个或多个function的数组；
*   **errorMiddleware** : 全局错误处理中间件，`array<function>`，类型是包含一个或多个function的数组；
*   **controller** : 二级路由列表，`array<Controller|controller>`，可以提供Controller或者已经实例化后的controller数组；
*   **onServe** : 服务开始运行的钩子函数，`function`；
*   **onClose** : 服务结束运行的钩子函数，`function`；
*   **onResponse**:  请求响应前的回调函数，可以用于定制响应格式，`function`；
*   **slience** :  是否禁止打印log，，`boolean`，默认false；
*   **static** :  定义静态文件目录，`string|{path: string, maxAge: integer}`，可以接受string类型，表示目录，或者一个obejct， 参数会自动传给express.static()
*   **view**:  定义视图渲染模板,
    \-path:  模板文件夹，`string`， eg: './views'
    \-engine:  模板引擎 ，`object`，提供的值需要包含`__express`属性， eg: require('pug')
    \-type:  模板引擎名称，`string`，eg: 'pug'

#### example

```javascript
const { Server， Get， Query， Controller } = require('@totea/core')

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
  controller: [
	ChildControllerA,
	ChildControllerB
  ],
  static: './public',
  view: {
    path: './views',
    engine: require('pug'),
    type: 'pug',
  },
  slience: true
})
class Service {}

// 你也可以在实例化的时候传参，这里的参数会合并覆盖已经在装饰器中传的部分
const service = new Service({
	slience: false
})

service.start()
```

### ToteaServer

**ToteaServer** 经过Server装饰器包装后得到的类，也可以直接从totea中引用：

```javascript
const { ToteaServer } = require('@totea/core')

const service = new ToteaServer()

service.start()

// 上面的例子等同于
const { Server } = require('@totea/core')

@Server()
class ToteaServer{}

const service = new ToteaServer()

service.start()
```

#### 实例属性

*   **app** : 创建的express实例；
*   **server** : 创建的http server；
*   **runing**: 获取当前服务运行状态，true表示正在运行；

#### 实例方法

*   **start()** : 开始运行server；
*   **stop()** : 停止运行server；
*   **status()**: 获取当前服务运行状态，true表示正在运行；
*   **useController(`Controller|controller`)** : 注入二级路由，可以提供Controller或者已经实例化后的controller；
*   **use()** : 等同于express中的app.use；
*   **all()**: 等同于express中的app.all；
*   **get()** :等同于express中的app.get；
*   **post()**: 等同于express中的app.post；
*   **patch()** : 等同于express中的app.patch；
*   **delete()**: 等同于express中的app.delete；
*   **put()** : 等同于express中的app.put；

### Controller

```javascript
const { Controller } = require('@totea/core')
```

#### 参数

**Controller** 装饰器用于定义二级路由，包含以下参数：

*   **name** :  controller名称，`string`，不可包含`/`字符，我们默认会使用[humps](https://www.npmjs.com/package/humps)对名称进行格式化，转换为驼峰格式，绑定的路由路径将转换为小写字符，并用-相连

    | Input     |    Name(`camelize`) | Path(`decamelize, separator: -`)  |
    | :-------- | :--------:| --: |
    | @Controller(''hello-world_route')  | helloWorldRoute |  /hello-world-route   |
    | @Controller(''Phone')     |   phone |  /phone  |
    | @Controller('/SubRoute')      |    subRoute | /sub-route  |

#### example

下面这个例子演示了如何通过`this.controllers.${controllerName}`的方式在server或者每个controller中获取控制器实例，另外，在每个 controller 中可以通过`this.server`获取到server实例，这样极大的方便了代码复用：

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

**ToteaController** 经过Controller装饰器包装后得到的类，也可以直接从totea中引用：

    // 不使用装饰器的写法
    const { ToteaServer, ToteaController } = require('@totea/core')

    const controller = new ToteaController('child')

    const service = new ToteaServer({
    	controller: [controller]
    })

    service.start()

    // 上面的例子等同于
    const { Server， Controller } = require('@totea/core')

    @Controller('child')
    class ToteaController{}

    @Server()
    class ToteaServer{}

    const service = new ToteaServer({
    	controller: [ToteaController]
    })

    service.start()

#### 实例属性

*   **router** : 该controller创建的Router实例；
*   **url** : 该controller绑定的url地址；
*   **name**: 该controller的名称；

#### 实例方法

*   **getRouter()** : 返回该controller创建的Router实例；
*   **use()** : 等同于该控制器的router.use；
*   **all()**: 等同于该控制器的router.all；
*   **get()** :等同于该控制器的router.get；
*   **post()**: 等同于该控制器的router.post；
*   **patch()** : 等同于该控制器的router.patch；
*   **delete()**: 等同于该控制器的router.delete；
*   **put()** : 等同于该控制器的router.put；

> 由此可见Server装饰器其实也是一种Controler装饰器，它们具有基本一样的方法，区别是Server中，调用`use | all | get`等方法，会把路由绑定到app，而在controller中，是绑定到内部的router中。而在express中，app本来就是一个特殊的router，不是吗？

阅读接下来的文档你可以发现，totea中的概念非常简单，它提供了基本一致的api以及尽量少的装饰器方法，对于开发者来说，非常容易掌握。

### Methods

**Methods** 装饰器用于给Server或者Controller添加路由绑定，包含以下几个 ：

*  **Get**: 绑定get请求
*  **Post**: 绑定postt请求
*  **Delete**: 绑定delete请求
*  **Patch**: 绑定patch请求
*  **Put**: 绑定put请求

参数： 表示绑定的路由地址，与 express中的地址一样，`string|regexp`，支持字符串或者正则表达式,可选，如果省略参数，则使用绑定的函数名称作为地址。

#### 错误的例子

> 注意：同一个url和method不可以绑定给不同的函数，不同的url也不能绑定到同一个函数，它们必须时一一对应的，totea可以校验大部分的错误场景，但是有一些需要开发者从编码上去规范。

```javascript
@Server()
class Service {
  @Get('/user')
  getUser() {
    return { id: 1, name: 'leo' }
  }

  @Get('/user')  // ERROR, can not bind /user again
  getUser2() {
    return { id: 2, name: 'tony' }
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
    return { id: 1, name: 'leo' }
  }

  @Get('/user2')
  getUser() {  // ERROR, can not bind /user2 to getUser
    return { id: 2, name: 'tony' }
  }
}
// will get a Error
Error: the callback:getUser has already bound to url: /user, method: get
```

#### 应当避免的情况

> 下面这个示例将不会报错，在同一个class中定义两个相同的方法似乎不是错的，但我们非常不建议这么做，这会使得代码逻辑非常混乱。

```javascript
@Server()
class Service {
  @Get('/user')
  getUser() {
    return { id: 1, name: 'leo' }
  }

  getUser() {  // RIGHT, but not recommand
    return { id: 2, name: 'tony' }
  }
}
```

#### RESTful

> 同一个url可以绑定给不同的函数，前提是使用不同的方法，比如@Get('/user') @Post('/user')可以分别绑定给不同方法，这常用于创建RESTful风格的api。

下面这个示例演示了使用totea创建restful风格的api接口：

```javascript
const { Server, Get, Post, Delete, Put } = require('@totea/core')

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
```

#### 绑定后的方法

当该方法被绑定到指定的路由，对应的请求将会由该方法来负责响应，每个请求的上下文将通过参数的形式注入。所有的参数：
*  **req**: context.req
*  **res**: context.res
*  **next**: context.next
*  **query**: context.req.query
*  **body**: context.req.body
*  **headers**: context.req.headers
*  **params**: context.req.params
所有的参数将会注入到一个context 对象中，并注入到方法的第一个参数。

```javascript
@Server()
class Service {
  @Post('/all_arg')
  getData({ res, req, next, headers, query, body, params  }) {
	// response with res.json
	res.json({ status: 2000, message: 'OK' })
  }
}
```

### Paramters

**Paramters** 装饰器用于给请求添加参数过滤器，包含以下几个 ：
*  **Body** body过滤器
*  **Query** query过滤器
*  **Params** params过滤器
*  **Headers** headers过滤器

#### 校验器

第一个参数表示校验器，`必填`，支持以下几种类型：
*  `function` 参数是对应的请求内容,请看示例：

```javascript
const { Server, Get, Query, Body } = require('@totea/core')

@Server()
class Service {
  @Get()
  @Query(query => query.id && query.id.length === 10)  // 当req.query.id存在且长度为10时，返回true，表示校验通过, 不通过将收到{status: 400, message: "Bad Request"}
  @Body(body => {
	// 返回字符串格式，表示错误信息,将收到{status: 400, message: "please provide a name"}
	if (!body.name) return 'please provide a name'
	// 没有返回或者返回true，表示检验通过
  })
  @Params(params => {
    // 返回Error，表示http error 将收到{status: 400, message: error.message"}
	if (!params.address) return new Error()
  })
  @Headers(headers => {
	// 返回数字格式，表示http error status, 将收到{status: 401, message: "Unauthorized"}
	if (!headers.token) return 401
  })
  getData() {
	
  }
}
```

*   `tegund.ObjectT` 由[tegund](https://www.npmjs.com/package/tegund)创建的object
    totea中大量使用了tegund作为动态参数校验工具，它在常规的请求参数校验中同样非常有用。

另外，totea框架本身依赖于tegund，这意味着你不用另外安装，可以直接引用，请看示例：

```javascript
const { object, string, integer } = require('tegund')
const { Server, Body, Query, Body } = require('@totea/core')

@Server()
class Service {
  @Get()
  @Body(
	object({
		name: string().min(2).max(10),  // req.body.name 必须是字符串，且长度在2-10
		age: integer().min(0) //  req.body.age 必须是一个非负整数
	})
  )
  getData() {
	
  }
}
```

tegund将会校验参数，在校验失败时返回对应的错误信息，你只需要提供合适的校验器。

甚至还可以省略object，直接：

```javascript

  @Body({
	name: string().min(2).max(10),
	age: integer().min(0)
  })
```

对于更简单的情形，甚至可以这样：

```javascript

  @Body({
	name: 'string',
	age: 'integer'
  })
```

更多的内容，请参阅[tegund说明文档](https://www.npmjs.com/package/tegund)

#### 默认错误信息

第二个参数用于指定一个默认的错误信息，`选填`，`string`类型

```javascript
const { Server, Get, Query, Body } = require('@totea/core')

@Server()
class Service {
  @Get()
  // 不通过将收到{status: 400, message: "expected a string id, length = 10"}
  @Query(query => query.id && query.id.length === 10, "expected a string id, length = 10")
  getData() {
	
  }
}
```

错误信息的`优先级`是 校验器返回的错误信息 > 第二个参数指定的默认错误信息 > 对应httpError(没有特别指定的情况是400)的错误信息。

源代码如下：

```javascript
// result 表示校验器的返回值 errorMessage表示提供的默认错误信息
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

**Middleware** 装饰器用于给Server和Controller添加全局中间件，或者给某个请求添加单独的中间件。

> 中间件是express的核心，这在totea中同样重要，你可能发现了，上面讲到的Paramters参数校验器其实也是一种特殊的中间件，不是吗？

#### 全局中间件

```javascript
const { Server, Middleware } = require('@totea/core')

@Server()
@Middleware((req, req, next) => {  // 第一个全局中间件
	console.log('call first global middleware of service')
	next()
})
@Middleware((req, req, next) => { // 再添加一个全局中间件，该中间件将会在第一个中间件执行完后执行
	console.log('call second global middleware of service')
	next()
})
class ToteaServer{}
```

同样可以为 controller添加：

```javascript
const { Controller, Middleware } = require('@totea/core')

@Controller('child')
@Middleware((req, req, next) => {  // 第一个子路由全局中间件
	console.log('call first global middleware of service')
	next()
})
@Middleware((req, req, next) => { // 再添加一个子路由全局中间件，该中间件将会在第一个中间件执行完后执行
	console.log('call second global middleware of service')
	next()
})
class ChildController {}
```

#### 私有中间件

你可以给某个单独的路由添加私有中间件：

```javascript
const { Server, Middleware } = require('@totea/core')

@Server()
class ToteaServer{
  @Get('/user')
  @Middleware((req, req, next) => {  // 第一个私有中间件
	  console.log('call first middleware of /user')
	  next()
  })
  @Middleware((req, req, next) => { // 再添加一个私有中间件，该中间件将会在第一个中间件执行完后执行
	  console.log('call second middleware of /user')
	  next()
  })
  getUser() {}
}
```

#### 使用Express中间件

我们说过，totea使用express作为web服务器，我们没有修改任何底层的逻辑，这意味着可以直接使用所有针对Express开发的中间件

示例，使用morgan来打印请求日志：

```javascript
const { Server, Middleware } = require('@totea/core')
const morgan = require('morgan')

@Server()
@Middleware(morgan('combined'))
class ToteaServer{}
```

#### 自带的日志中间件

当然，totea 也自带了一个简单的日志打印中间件，使用方法：

```javascript
const { Server, Logger, Get } = require('@totea/core')
const morgan = require('morgan')

@Server()
@Logger()
class Service{
	@Get('/user')
	getUser() {
		return {
			result: {"docs":[],"count":0,"page":1,"limit":10},
			message: 'user query success!'
		}
	}
}

// logs
[totea logger]: 2021-04-07T09:43:18.836Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1,"limit":10},"message":"user query success!"} 11ms

[totea logger]: 2021-04-07T09:45:07.921Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1,"limit":10},"message":"user query success!"} 3ms

[totea logger]: 2021-04-07T09:45:08.684Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1,"limit":10},"message":"user query success!"} 1ms

[totea logger]: 2021-04-07T09:45:09.346Z /user GET {"status":200,"result":{"docs":[],"count":0,"page":1,"limit":10},"message":"user query success!"} 1ms
```

## 成功响应

在express中，一般使用req.send 或者 res.json来响应请求，该方法在totea中也同样适用：

```javascript
@Server()
class Service{
	@Get('/user')
	getUser({ res }) {
		res.status(200).json({ status: 200, message: "OK" })
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

在totea中，我们有更加便捷的方式来返回json，只需要把内容放在函数的返回值中。
除json以外的请求，仍然需要使用res的方法来响应。

> 注意，当函数没有返回值，或者返回undefined（在实际的代码中无法分辨），totea会视作请求为被正确响应，返回{ status: 500, message: "Internal Server Error" }

```javascript
@Server()
class Service{
	@Get('/user')
	getUser() {  // 返回的内容将以{ status: 200, message: "OK", result: ${return} }形式包裹
		return { name: 'leo', address: 'XXX' }
	}

	@Get('/json')
	getPage() {
		// 假设返回的是一个obejct，且具有一个整数类型的status，或者有一个字符串格式非空的message，则返回该json
		return {
			status: 200,
			result: { name: 'leo', address: 'XXX' },
			message: 'OK'
		}
	}
}

// 以上两个请求都将返回一样的内容：
{
	status: 200,
	result: { name: 'leo', address: 'XXX' },
	message: 'OK'
}
```

> totea劫持了res的sendFile和send方法，以便在请求响应前，获取到预计要返回的内容。同时，我们也规避了重复响应请求的问题。

下面这个例子，当请求被res.json响应后，代码虽然会接着往下运行，但是不会再重复响应，当然，及时return是一个很好的编码习惯。

```javascript
@Server()
class Service{
	@Get('/user')
	getUser({ res, query }) {
		if (!query.id) {
			res.json({ status: 404, message: 'please provide a user id' })
		}
		return { name: 'leo', address: 'XXX' }
	}
}
```

## 失败响应

相比成功的响应，在实际编码中，接口返回错误的情形要更为普遍，totea提供了多种方式来处理：

> totea中使用[http-errors](https://www.npmjs.com/package/http-errors)来创建httpError，你可以直接引入该库，或者直接使用createHttpError方法。

```javascript
const { Server, Get, createHttpError } = require('@totea/core')
@Server()
class Service {
  // response by res, got: {"status":401,"message":"Unauthorized"}
  @Get('/error_res')
  errorRes({ res }) {
    res.json({ status: 401, message: 'Unauthorized' })
  }

  // return a Promise.reject， with a http status, got: {"status":404,"message":"Not Found"}
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

> Express并没有提供全局错误处理的方法，对于截获async/await抛出的异常尤为困难，totea默认使用[express-async-errors](https://www.npmjs.com/package/express-async-errors)，当截获未知错误时，始终返回一个{ status: 500, message: "Internal Server Error" }。

## 路由优先级

express 本身未提供路由优先级排序，路由的顺序决定于你的代码顺序。当使用express原生的方法来定义路由时，你的app可能存在不可触达的死区：

```javascript
const express = require('express')

const app = express()

app.get('/:id', (req, res) => {  // 所有的请求都在这里被响应了
  res.json({ id: req.params.id })
})

app.get('/user', (req, res) => {  // 死区
  res.json({ user: 'leo' })
})

app.listen(3000)
```

这与我们预期的情况不符，我们希望具体路由先匹配，其次才是匹配式路由。

在totea中完全不需要担心这种情况，我们默认使用[sort-route-addresses](https://www.npmjs.com/package/sort-route-addresses)对路由的优先级进行了排序：

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

这个例子和上面完全一样，但是满足要求。

## HTTP状态码

totea的设计初衷心就是用于创建API服务器，用它来写接口将非常高效。

在实际的开发过程中，我们的接口可能会被要求始终以200的状态码来返回数据，而实际的状态信息在返回的json中去体现。
例如，客户端开发工程师可能会要求你这样设计接口：

```javascript
// 当请求成功时
Status status: 200 OK
response: { status: 200, message: "OK", result: [{ name: 'leo' }] }
// 当请求出错时，比如权限不足
Status status: 200 OK
response: { status: 401, message: "Unauthorized" }
```

这不得不说也是一种规范，但和主流的设计思想相悖，例如RESTful：

```javascript
// 当请求成功时
Status status: 200 OK
response: { result: [{ name: 'leo' }] }
// 当请求出错时，比如权限不足
Status status: 401 Unauthorized
response: null
```

关于这个问题在V2EX上有过激烈的讨论，原文地址： [API 使用 HTTP 状态码还是全部返回 200](https://www.v2ex.com/t/191534), 每个开发者都有不同的理解

totea默认使用第一种规范，但是允许开发者自定义响应，Server装饰器接受一个onResponse方法，该方法会在每次请求被返回前被调用，你可以提供一个自定义的方法去覆盖它。

默认的onResponse方法是：

```javascript
function onResponse({ res, status, result, message }) {
   res.json(
     removeEmpty({  // if some arg is undefined, will remove it
       status: status,
       message: message,
       result
     }, {
		removeNull: false,
		removeUndefined: true
	})
   )
 }
```

假设你想使用RESTful的规范：

```javascript
@Server({
	onResponse: ({ res, status, result, message }) => {
		res.status(status)
		res.json({ result, message })
	}
})
class Service {}
```

## HTML模板及静态目录

详细的例子请查看[地址](https://github.com/aim-leo/totea-core/tree/master/example/view)。

## 类似的框架
* `nestjs` [链接](https://www.npmjs.com/package/@nestjs/core) nestjs是一个大而全的框架，设计思想非常优秀。需要搭配typescript来使用，适合开发大型项目。
* `overnightjs`[链接](https://www.npmjs.com/package/@overnightjs/core) overnightjs的设计思路与totea较为相似，区别是它需要搭配typescript来使用。