import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function getAll(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      include: { brand: true, category: true },
    });

    const productsWithAnalytics = products.map((product) => {
      const activePrice = product.promotionalPrice
        ? product.promotionalPrice
        : product.sellingPrice;

      const unitProfit = activePrice - product.averageCost;

      const totalExpectedProfit = unitProfit * product.quantity;

      return {
        ...product,
        activePrice,
        unitProfit,
        totalExpectedProfit,
      };
    });

    return res.json(productsWithAnalytics);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar produtos" });
  }
}

export async function upsert(req: Request, res: Response) {
  const {
    name,
    brandId,
    categoryId,
    quantity,
    averageCost,
    sellingPrice,
    promotionalPrice,
    expiryDate,
    imageUrl,
  } = req.body;

  const trimmedName = name?.trim(); 

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { name: trimmedName },
    });

    if (existingProduct) {
      const currentQty = Number(existingProduct.quantity) || 0;
      const currentCost = Number(existingProduct.averageCost) || 0;
      const incomingQty = Number(quantity) || 0;
      const incomingCost = Number(averageCost) || 0;

      const totalQuantity = currentQty + incomingQty;

      const newAverageCost =
        totalQuantity > 0
          ? (currentQty * currentCost + incomingQty * incomingCost) /
            totalQuantity
          : incomingCost;

      const updatedProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          quantity: totalQuantity,
          averageCost: newAverageCost,
          sellingPrice: Number(sellingPrice) || existingProduct.sellingPrice,
        },
      });

      return res.json(updatedProduct);
    }

    const newProduct = await prisma.product.create({
      data: {
        name: trimmedName,
        brandId: Number(brandId),
        categoryId: categoryId ? Number(categoryId) : null,
        quantity: Number(quantity),
        averageCost: Number(averageCost || 0),
        sellingPrice: Number(sellingPrice || 0),
        promotionalPrice: promotionalPrice ? Number(promotionalPrice) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        imageUrl,
      },
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar produto" });
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
