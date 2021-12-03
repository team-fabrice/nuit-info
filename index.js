const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticFiles = require('koa-static')
const postgres = require('postgres')

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
        //new_article = {article_id:article_id, title:ctx.query.title, contents:ctx.query.content, created_at:created_at, updated_at:updated_at};
        ctx.body = `Ajout effectué (title:${title}; contents:${contents}; class:${meta_class})`;
    })
    .get('/randomArticle', async function(ctx, next){
        'use strict';
        const article = await sql` select * from article_rev order by random() limit 1`;
        ctx.body = article;
    })
    // .get('/Article', async function(ctx, next){
    //     'use strict';
    //     let title = ctx.query.title || -1;
    //     let contents = ctx.query.contents || -1;
    //     let first_name = ctx.name || -1;
    //     let last_name = ctx.lastname || -1;
    //     const article = await sql`select * from article_rev where title = ${title} or contents = ${contents} or meta_person_first_name = ${first_name} or  `
    // })
    .get('/HonorTable', async function(ctx, next){
        'use strict';
        const names = await sql`select meta_person_first_name, meta_person_last_name, meta_class from article_rev where meta_class = 'person'`;
        ctx.body = '';
        for(let i = 0; i < names.length; i++){
            ctx.body += `${names[i].meta_person_first_name} ${names[i].meta_person_last_name}, `;
        }
        ctx.body = ctx.body.substring(0,ctx.body.length - 2 );
    })
    .get('/SortieMer', async function(ctx, next){
        'use strict';
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


app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
