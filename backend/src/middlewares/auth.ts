import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction): Response | void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido. Acesso negado." });
  }

  const [, token] = authHeader.split(' ');

  if (!token) { 
    return res.status(401).json({ error: "Token malformado ou ausente. Acesso negado." });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado. Faça login novamente." });
  }
}