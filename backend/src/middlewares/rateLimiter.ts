import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false, 
  message: {
    status: 429,
    error: "Muitas requisições vindo deste IP, por favor tente novamente mais tarde."
  }
});