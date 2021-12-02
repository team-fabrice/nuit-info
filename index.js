const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticFiles = require('koa-static')

const app = new Koa()
const router = new Router()
const render = views(__dirname + '/views', {
    map: {
        html: 'ejs',
    }
})

app.use(render)
app.use(staticFiles('public'))

router.get('/', async (ctx) => {
    await ctx.render('index.ejs', { message: 'test !' })
})


let article = {
    title : 'Ceci est un titre',
    img : '/img/test.png',
    description : 'Ceci est la description de l\'article'
}

  

router.get('/resultatsderecherche', async (ctx) => {
    await ctx.render('resultatsderecherche.ejs', { filtres: ':filtres', resultats: [article] })
})

router.get('/apropos', async (ctx) => {
    await ctx.render('apropos.ejs', { message: 'test !' })
})

app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
