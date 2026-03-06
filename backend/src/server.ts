import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { limiter } from './middlewares/rateLimiter.js';

import authRouter from './routes/auth.routes.js';
import brandsRouter from './routes/brands.routes.js'; 
import categoriesRoutes from './routes/categories.routes.js';
import customersRoutes from './routes/customers.routes.js';
import installmentsRoutes from './routes/installments.routes.js';
import productsRouter from './routes/products.routes.js';
import salesRoutes from './routes/sales.routes.js';


const app = express();

app.use(helmet());

app.use(cors({
  origin: '*' 
}));

app.use(limiter);

app.use(express.json());

app.use('/auth', authRouter);
app.use('/brands', brandsRouter);
app.use('/categories', categoriesRoutes);
app.use('/customers', customersRoutes);
app.use('/installments', installmentsRoutes);
app.use('/products', productsRouter);
app.use('/sales', salesRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send('API do Estoque está rodando! 🚀');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});