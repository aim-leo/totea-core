const { Logger } = require('../../logger')

const { Server, Get, createHttpError } = require('../../index')

@Server({
  port: 4000,
  onServe() {
    console.log('service is start success')
  },
  onClose() {
    console.log('service is closed')
  },
  static: ['pages'],
  view: {
    path: './jades',
    engine: require('pug'),
    type: 'pug',
  }
})
class Service {
  @Get('/html')
  getHtml({ res }) {
    res.sendFile('test.html', { root: 'pages' })
  }

  @Get('/jade')
  getJade({ res }) {
    res.render('index', { title: 'totea jade page' })
  }

  @Get('/error')
  getError({ res }) {
    const error = createHttpError(401)
    res.render('error', {
      message: error.message,
      error: error
    })
  }

  @Get('/json')
  getJson({ res }) {
    res.json({ data: 1 })
  }
}

const service = new Service()

service.start()
