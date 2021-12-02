const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')

const app = new Koa()
const router = new Router()
const render = views(__dirname + '/views', {
    map: {
        html: 'ejs',
    }
})

app.use(render)

router.get('/', async (ctx) => {
    await ctx.render('index.ejs', { message: 'test !' })
})

app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
