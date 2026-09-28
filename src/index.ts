import 'dotenv/config';
import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { login, requireAuth } from './auth.js';

const app = new Koa();
const router = new Router();
const port = Number(process.env.PORT ?? 3000);

router.post('/login', bodyParser({ enableTypes: ['json', 'form'] }), login);

router.get('/analyze', requireAuth, (ctx) => {
  ctx.body = 'ok';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
