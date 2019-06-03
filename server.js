const Koa = require('koa')
const koaStatic = require('koa-static')

const server = new Koa()
server.use(koaStatic('.')).listen(8888)