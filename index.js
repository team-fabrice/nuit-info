const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticFiles = require('koa-static')
const postgres = require('postgres')
const wikiLink = require('./src/markdown')

let urlDb = 'postgres://nuit_info:teamfabrice@edgar.bzh/nuit_info';
const sql = postgres(urlDb, {});

const app = new Koa()
const router = new Router()
const render = views(__dirname + '/views', {
    map: {
        html: 'ejs',
    }
})

marked.use({ extensions: [wikiLink(sql)] })
app.use(render)
app.use(staticFiles('public'))

router
    .get('/', async (ctx) => {
        await ctx.render('index.ejs', { message: 'test !' })
    })
    .get('/insertArticle', async function (ctx, next){
        'use strict';
        let title = ctx.query.title;
        let contents = ctx.query.contents;
        let created_at = new Date();
        let updated_at = new Date();
        const [new_article] = await sql` insert into article_rev (revision_id, article_id, title, contents, created_at, updated_at) values (uuid_generate_v4 (), uuid_generate_v4 (), ${title}, ${contents}, ${created_at}, ${updated_at} )`;
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
