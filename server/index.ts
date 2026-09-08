import { operations } from './operations';
import { printing } from './printing';
import express from 'express';
import cors from 'cors';
import { router } from './routes';
import { files } from './files';
import { seed } from './seed';
import { initAuth } from './auth';
seed();
initAuth();
const app = express();
app.use(
  cors({
    origin: [
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://localhost:5173',
      'http://localhost:5174',
      'null',
    ],
  }),
);
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_q, r) => r.json({ ok: true, mode: 'mock' }));
app.use('/api', router, files, printing, operations);
app.use((e: Error, _q: express.Request, r: express.Response, _n: express.NextFunction) =>
  r.status(400).json({ ok: false, error: e.message }),
);
app.listen(Number(process.env.PORT || 8787), '127.0.0.1', () =>
  console.log('Mock API http://127.0.0.1:8787 · 数据 .data/studio.sqlite'),
);
