import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPass) {
    const token = jwt.sign(
      { role: 'admin' }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1d' }
    );
    
    return res.json({ token });
  }

  return res.status(401).json({ error: "E-mail ou senha incorretos." });
}