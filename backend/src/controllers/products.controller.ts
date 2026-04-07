import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

async function createNewProduct(trimmedName: string, data: any) {
  return await prisma.product.create({
    data: {
      name: trimmedName,
      brandId: Number(data.brandId),
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      quantity: Number(data.quantity) || 0,
      averageCost: Number(data.averageCost || 0),
      sellingPrice: Number(data.sellingPrice || 0),
      promotionalPrice: data.promotionalPrice ? Number(data.promotionalPrice) : null,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      imageUrl: data.imageUrl,
    },
  });
}

async function addStockToExistingProduct(existingProduct: any, data: any) {
  const currentQty = Number(existingProduct.quantity) || 0;
  const currentCost = Number(existingProduct.averageCost) || 0;
  const incomingQty = Number(data.quantity) || 0;
  const incomingCost = Number(data.averageCost) || 0;

  const totalQuantity = currentQty + incomingQty;
  const newAverageCost = totalQuantity > 0
    ? (currentQty * currentCost + incomingQty * incomingCost) / totalQuantity
    : incomingCost;

  return await prisma.product.update({
    where: { id: existingProduct.id },
    data: {
      quantity: totalQuantity,
      averageCost: newAverageCost,
      sellingPrice: Number(data.sellingPrice) || existingProduct.sellingPrice,
      imageUrl: data.imageUrl || existingProduct.imageUrl,
    },
  });
}

export async function upsert(req: Request, res: Response) {
  const data = req.body;
  const trimmedName = data.name?.trim(); 

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { name: trimmedName },
    });

    if (existingProduct) {
      const updatedProduct = await addStockToExistingProduct(existingProduct, data);
      return res.status(200).json(updatedProduct);
    }

    const newProduct = await createNewProduct(trimmedName, data);
    return res.status(201).json(newProduct);

  } catch (error) {
    console.error("Erro no upsert:", error);
    return res.status(500).json({ error: "Erro ao processar produto" });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        name: data.name?.trim(),
        brandId: Number(data.brandId),
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        quantity: Number(data.quantity),
        sellingPrice: Number(data.sellingPrice),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        imageUrl: data.imageUrl
      }
    });
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao editar produto" });
  }
}

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
