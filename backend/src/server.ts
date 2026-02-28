import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { limiter } from './middlewares/rateLimiter';

import authRouter from './routes/auth.routes';
import brandsRouter from './routes/brands.routes'; 
import categoriesRoutes from './routes/categories.routes';
import customersRoutes from './routes/customers.routes';
import installmentsRoutes from './routes/installments.routes';
import productsRouter from './routes/products.routes';
import salesRoutes from './routes/sales.routes';


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