import 'dotenv/config';
import express from 'express';
import ViteExpress from 'vite-express';
import { apiRouter } from './router/api';

const app = express();

const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.use('/api', apiRouter);

app.use((err: any, req: any, res: any, next: any) => {
  res.status(500);
  res.json({ error: err.message });
});

if (process.env.NODE_ENV === 'production') {
  ViteExpress.config({
    mode: 'production',
  });
}

ViteExpress.listen(app, port, () =>
  console.log(
    `Server is listening on port ${port}, visit with: http://localhost:${port}`
  )
);
