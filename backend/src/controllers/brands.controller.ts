import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getAll(_req: Request, res: Response) {
  try {
    const brands = await prisma.brand.findMany();
    return res.json(brands);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar marcas" });
  }
}

export async function create(req: Request, res: Response) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  try {
    const brand = await prisma.brand.create({
      data: { name },
    });
    return res.status(201).json(brand);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar marca" });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "O novo nome é obrigatório" });
  }

  try {
    const updatedBrand = await prisma.brand.update({
      where: { id: Number(id) },
      data: { name },
    });
    return res.json(updatedBrand);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar a marca" });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.brand.delete({
      where: { id: Number(id) },
    });
    
    return res.status(204).send(); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao deletar a marca" });
  }
}