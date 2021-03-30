const path = require('path')

const { Server, Get, createHttpError } = require('../../index')

@Server({
  port: 4000,
  onServe() {
    console.log('service is start success')
  },
  onClose() {
    console.log('service is closed')
  },
  static: ['public'],
  view: {
    path: './jades',
    engine: require('pug'),
    type: 'pug',
  }
})
class Service {
  @Get('/html')
  getHtml({ res }) {
    res.sendFile('test.html', { root: 'public' })
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
