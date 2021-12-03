const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticFiles = require('koa-static')
const wikiLink = require('./src/markdown')

const app = new Koa()
const router = new Router()
const render = views(__dirname + '/views', {
    map: {
        html: 'ejs',
    }
})

marked.use({ extensions: [wikiLink] })
app.use(render)
app.use(staticFiles('public'))

router.get('/', async (ctx) => {
    await ctx.render('index.ejs', { message: 'test !' })
})

router.get('/article/:uuid', async (ctx) => {
    await ctx.render('article.ejs', {
        title: 'Jean Dupont',
        content:
`Jean Dupont est né en 1994. Il a sauvé **beaucoup** de gens.
`,
    })
})

app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
