const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const passport = require('koa-passport');
const RedisStore = require('koa-redis');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// sessions
app.keys = ['\xa1\xdbn\x80\x91E[\x8a\xd6\x0c\x91R\x1fG\xc88\xcc\xa0\x9f\xe1\x120\x98\x86'];
app.use(session({ store: new RedisStore() }, app));

// body parser
app.use(bodyParser());

// authentication
require('./auth');
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use(indexRoutes.routes());
app.use(authRoutes.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
