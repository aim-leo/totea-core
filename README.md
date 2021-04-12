<p align="center">
  <img width="320" src="https://aim-leo.github.io/totea-core/logo.svg">
</p>

<h3 align="center" style="text-align: center">
  Use decorators and javascript to build web services
</h3>

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
Let's create a simple user service, including the addition, deletion, modification, and checking of users, and then create a secondary route to obtain the tag list of users.

```javascript
const { Server, Get, Post, Delete, Put, Middleware, Controller，Params } = require('@totea/core')

// add a sub-route
@Controller('tag')
class tagController {
  @Get('/list')  // GET /tag/list
  getTag() {}
}

@Server({
	port: 4000, // set port to 4000
	controller: [tagController]  // provide it to Server
})
@Middleware((req, res, next) => {   // add a global middleware
	next()
})
class Service {
  @Get('/user')  // GET /user
  getUser() {}

  @Get('/user/:id') // GET /user/${id}
  @Middleware((req, res, next) => {  // add a private middleware
	next()
  })
  getUserById({ params }) {}

  @Post('/user')  // POST /user
  insertUser({ body }) {}

  @Delete('/user/:id')  // DELETE /user/${id}
  // add a params filter: the req.params.id must set and length = 10
  @Params(params => params.id && params.id.length === 10)
  deleteUserById({ params }) {}

  @Put('/user/:id') // PUT /user/${id}
  modifyUserById({ params, body }) {}
 }

const service = new Service()
service.start()

```

This is all the code, isn't it simple?
 
For detailed usage, please check the [Document](https://aim-leo.github.io/totea-core/)

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

## License

[MIT](https://github.com/aim-leo/totea-core/blob/master/LICENSE)

Copyright (c) 2021-present aim-leo