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
    .get('/Article', async function(ctx, next){
        'use strict';
        let first_name = ctx.query.first_name ;
        let last_name = ctx.query.last_name;
        // where meta_person_first_name like ${first_name} and meta_person_last_name like ${last_name}
        const articles = await sql`select * from article_rev  where meta_person_first_name like ${first_name} and meta_person_last_name like ${last_name}`;
        console.log(articles);
        ctx.body = `<h1>${articles[0].meta_person_first_name} ${articles[0].meta_person_last_name}</h1>`;
        ctx.body += `<h2>${articles[0].title}</h2>`;
        ctx.body += `<p>${articles[0].contents}</p>`;
    })
    .get('/tableauhonneur', async function(ctx, next){
        'use strict';
        const names = await sql`select meta_person_first_name, meta_person_last_name, meta_class from article_rev where meta_class = 'person'`;
        let res = ["", ""];
        for(let i = 0; i < names.length; i++){
            res[i] = [`Article?first_name=${names[i].meta_person_first_name}&last_name=${names[i].meta_person_last_name}`,names[i].meta_person_first_name,names[i].meta_person_last_name];
        }
        console.log(res);
        await ctx.render('tableauhonneur.ejs', { resultats: res })
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
    .get('/search', async function(ctx, next){
        'use strict';
        let s1 = ctx.query.s1;
        let s2 = ctx.query.s2;
        const res = JSON.stringify({s1,s2});
        console.log(res);
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

router.get('/form', async (ctx) => {
    await ctx.render('form.ejs', { message: 'test !' })
})

router.get('/presse', async (ctx) => {
    await ctx.render('presse.ejs', { message: 'test !' })
})

router.get('/tableauhonneur', async (ctx) => {
    await ctx.render('tableauhonneur.ejs', { message: 'test !' })
})

router.get('/nossauveteurs', async (ctx) => {
    await ctx.render('nossauveteurs.ejs', { message: 'test !' })
})

router.get('/lesacteurs', async (ctx) => {
    await ctx.render('lesacteurs.ejs', { message: 'test !' })
})

router.get('/pilotage', async (ctx) => {
    await ctx.render('pilotage.ejs', { message: 'test !' })
})

app
    .use(router.routes())
    .use(router.allowedMethods)

app.listen(8080)
