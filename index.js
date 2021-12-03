const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticFiles = require('koa-static')
const postgres = require('postgres')

let urlDb = 'postgres://nuit_info:teamfabrice@edgar.bzh/nuit_info';
const sql = postgres(urlDb, {});

const app = new Koa()
const router = new Router()
const render = views(__dirname + '/views', {
    map: {
        html: 'ejs',
    }
})


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
        //new_article = {article_id:article_id, title:ctx.query.title, contents:ctx.query.content, created_at:created_at, updated_at:updated_at};
        ctx.body = `Ajout effectué (title:${title}; contents:${contents})`;
    })
    .get('/randomArticle', async function(ctx, next){
        'use strict';
        const article = await sql` select * from article_rev order by random() limit 1`;
        ctx.body = article;
    })

app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
