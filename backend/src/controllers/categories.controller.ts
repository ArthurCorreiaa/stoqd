import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getAll(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany();
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar categorias" });
  }
}

export async function create(req: Request, res: Response) {
  const { name } = req.body;
  try {
    const category = await prisma.category.create({ data: { name } });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar categoria" });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const category = await prisma.category.update({
      where: { id: Number(id) },
      data: { name },
    });
    return res.json(category);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.category.delete({ where: { id: Number(id) } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: "Erro ao deletar categoria" });
  }
}