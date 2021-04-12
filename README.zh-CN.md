<p align="center">
  <img width="320" src="https://aim-leo.github.io/totea-core/logo.svg">
</p>


<h3 align="center" style="text-align: center">
  使用装饰器和javascript构建web服务
</h3>

<br/>
<br/>
<br/>


简体中文 | [English](./README.md)

## 简介

**totea**是一个基于express的nodejs框架，使用装饰器来定义路由和中间件。特点概述:

*   **javascript** : 现有的使用装饰器的框架都默认使用typescript，totea可以在javascript中使用，只需要引入[plugin-proposal-decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)；
*   **简单高效** : totea提供了不到20个装饰器函数，却可以支持多种复杂使用场景；
*   **易于整合** : totea使用express作为web服务器，我们没有修改任何底层的逻辑，这意味着在express中能使用的方法和插件，也可以在totea中使用。

***

## 示例
让我们来创建一个简单的用户服务， 包含user的增删改查，再创建一个二级路由，用于获取user的tag列表。

```javascript
const { Server, Get, Post, Delete, Put, Middleware, Controller，Params } = require('@totea/core')

// 添加一个二级路由， 名称为tag
@Controller('tag')
class tagController {
  @Get('/list')  // GET /tag/list
  getTag() {}
}

@Server({
	port: 4000, // 把端口设置为4000
	controller: [tagController]  // 把上面创建的控制器注入到服务
})
@Middleware((req, res, next) => {   // 添加一个全局中间件
	next()
})
class Service {
  @Get('/user')  // GET /user
  getUser() {}

  @Get('/user/:id') // GET /user/${id}
  @Middleware((req, res, next) => {  // 为/user/${id}添加一个私有中间件
	next()
  })
  getUserById({ params }) {}

  @Post('/user')  // POST /user
  insertUser({ body }) {}

  @Delete('/user/:id')  // DELETE /user/${id}
  // 添加一个参数过滤器，req.params.id必须提供且长度为10
  @Params(params => params.id && params.id.length === 10)
  deleteUserById({ params }) {}

  @Put('/user/:id') // PUT /user/${id}
  modifyUserById({ params, body }) {}
 }

const service = new Service()
service.start()

```

 这就是全部的代码了，是不是很简单？
 
详细的使用方法，请查看[说明文档](https://aim-leo.github.io/totea-core/README.zh-CN.html) 

## 安装使用

```bash
# 安装 totea
npm i @totea/core

# 安装并配置babel
npm i @babel/core @babel/node @babel/plugin-proposal-decorators

# 如果你的项目已经有babel配置， 把@babel/plugin-proposal-decorators加到你的配置文件中
# 没有的化创建一个babel.config.js文件，写入以下内容
module.exports = {
  plugins: [
    ["@babel/plugin-proposal-decorators", {legacy: true }]
  ],
};

# 使用babel-node运行你的项目
npx babel-node index.js
```

## License

[MIT](https://github.com/aim-leo/totea-core/blob/master/LICENSE)

Copyright (c) 2021-present aim-leo