const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticFiles = require('koa-static')
const postgres = require('postgres')
const parseMd = require('./src/markdown')
const { execSync } = require('child_process')

const urlDb = require('./configdb').urlDb;
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
        let meta_class = ctx.query.meta_class;
        let created_at = new Date();
        let updated_at = new Date();
        const [new_article] = await sql` insert into article_rev (revision_id, article_id, title, contents, created_at, updated_at, meta_class, meta_event_date) values (uuid_generate_v4 (), uuid_generate_v4 (), ${title}, ${contents}, ${created_at}, ${updated_at}, ${meta_class}, ${new Date()})`;
        ctx.body = `Ajout effectué (title:${title}; contents:${contents}; class:${meta_class})`;
    })
    .get('/randomArticle', async function(ctx, next){
        'use strict';
        const article = await sql` select * from article_rev order by random() limit 1`;
        ctx.body = article;
    })
    .get('/honor-table', async function(ctx, next){
        'use strict';
        const data = await sql`select * from article_rev where meta_class = 'person'`;
        await ctx.render('all-articles.ejs', {
            items: data,
            title: 'Tableau d\'honneur'
        })
    })
    .get('/SortieMer', async function(ctx, next){
        const sorties = await sql`select title, meta_event_date from article_rev where meta_event_date is not null `;
        let century = ctx.query.event_date || -1;
        ctx.body = "";
        for(let i = 0; i < sorties.length; i++){
            if(sorties[i].meta_event_date.getFullYear().toString().substring(0, 2) == century){
                ctx.body += `${sorties[i].meta_event_date.getFullYear().toString()} - ${sorties[i].title}, `; 
            }   
        }
        ctx.body = ctx.body.substring(0,ctx.body.length - 2 );
    })



router.get('/recherche', async (ctx) => {
    const query = ctx.query.q
    const out = JSON.parse(execSync('python3 main.py', { input: JSON.stringify({ title: query }) }))
    await ctx.render('resultatsderecherche.ejs', { filtres: ':filtres', resultats: out })
})

router.get('/apropos', async (ctx) => {
    await ctx.render('apropos.ejs', { message: 'test !' })
})

router.get('/article/new', async (ctx) => {
    await ctx.render('editor.ejs', {
        title: '',
        contents: '',
        isNew: true,
    })
})

router.get('/article/:uuid', async (ctx) => {
    const [art] = await sql`SELECT * FROM article_rev WHERE article_id = ${ctx.params.uuid} AND modification_author is NULL`
    art.contents = await parseMd(sql, art.contents)
    await ctx.render('article.ejs', art)
})

router.get('/article/:uuid/edit', async (ctx) => {
    const [art] = await sql`SELECT * FROM article_rev WHERE article_id = ${ctx.params.uuid} AND modification_author is NULL`
    art.isNew = false
    await ctx.render('editor.ejs', art)
})

router.get('/rev/:uuid', async (ctx) => {
    const [art] = await sql`SELECT * FROM article_rev WHERE revision_id = ${ctx.params.uuid}`
    art.contents = await parseMd(sql, art.contents + '\n\n```\n' + JSON.stringify(art, null, 2) + '\n```\n')
    await ctx.render('article.ejs', art)
})

app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
