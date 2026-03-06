import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getAll(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      include: { brand: true, category: true } 
    });

    const productsWithAnalytics = products.map(product => {
      const activePrice = product.promotionalPrice ? product.promotionalPrice : product.sellingPrice;
      
      const unitProfit = activePrice - product.averageCost;
      
      const totalExpectedProfit = unitProfit * product.quantity;

      return {
        ...product,
        activePrice,
        unitProfit,
        totalExpectedProfit
      };
    });

    return res.json(productsWithAnalytics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
}

export async function create(req: Request, res: Response) {
  const { 
    name, brandId, categoryId, quantity, averageCost, 
    sellingPrice, promotionalPrice, expiryDate, imageUrl 
  } = req.body;

  try {
    const product = await prisma.product.create({
      data: {
        name,
        brandId: Number(brandId),
        categoryId: categoryId ? Number(categoryId) : null,
        quantity: Number(quantity),
        averageCost: Number(averageCost || 0),
        sellingPrice: Number(sellingPrice || 0),
        promotionalPrice: promotionalPrice ? Number(promotionalPrice) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        imageUrl
      },
    });
    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar produto" });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { 
    name, brandId, categoryId, quantity, averageCost, 
    sellingPrice, promotionalPrice, expiryDate, imageUrl 
  } = req.body;

  try {
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (brandId !== undefined) updateData.brandId = Number(brandId);
    if (categoryId !== undefined) updateData.categoryId = categoryId ? Number(categoryId) : null;
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (averageCost !== undefined) updateData.averageCost = Number(averageCost);
    if (sellingPrice !== undefined) updateData.sellingPrice = Number(sellingPrice);
    if (promotionalPrice !== undefined) updateData.promotionalPrice = promotionalPrice ? Number(promotionalPrice) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });
    
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar produto" });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao eliminar produto" });
  }
}