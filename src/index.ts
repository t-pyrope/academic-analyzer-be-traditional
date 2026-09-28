import 'dotenv/config';
import Koa from 'koa';
import Router from '@koa/router';

const app = new Koa();
const router = new Router();
const port = Number(process.env.PORT ?? 3000);

router.get('/analyze', (ctx) => {
  ctx.body = 'ok';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
