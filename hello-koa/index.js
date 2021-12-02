const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const views = require('koa-views')

const app = new Koa();
const router = new Router();
app.use(bodyParser());
app.use(cors());
const render = views(__dirname + '/views', {
  map: {
      html: 'ejs',
  }
})

const session = require('koa-session');
app.keys = ['key'];
app.use(session(app));

app.use((ctx, next) => {
  // console.log("ctx", ctx);
  // ctx.body = "<h1>Hello Koa</h1>";

  //ignore favicon
  if (ctx.path === '/favicon.ico') return;

  let counter = ctx.session.counter || 0;
  counter = ++counter;
  ctx.session.counter = counter;
  // ctx.body = `Vous êtes venu ${counter} fois.`;
  next();
  });

  router
  .get("/users/:id", async (ctx) => {
    const id = ctx.params.id;
    console.log("query params", ctx.query);
    const counter = ctx.session.counter;
    ctx.body = `Visite n° ${counter} de l'utilisateur ${id}`;
  } )
  .get("/", async (ctx) => {
    await ctx.render('index.ejs', { message: 'test !' })
  })
  .post("/", (ctx) => {
    console.log("ctx.request.body", ctx.request.body);
    ctx.body = {...ctx.request.body, date: new Date()};
  });


  app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
