import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function create(req: Request, res: Response) { 
  const { customerId, items, installmentsCount = 1, observation } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "A venda precisa ter pelo menos um item." });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      
      let totalSale = 0;
      const saleItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: Number(item.productId) } });
        
        if (!product) throw new Error(`Produto ID ${item.productId} não encontrado.`);
        if (product.quantity < item.quantity) throw new Error(`Estoque insuficiente para ${product.name}.`);

        const itemTotal = product.sellingPrice * item.quantity;
        totalSale += itemTotal;

        saleItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.sellingPrice
        });

        await tx.product.update({
          where: { id: product.id },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      const installmentsData = [];
      const installmentValue = totalSale / installmentsCount;
      const isPaidUpfront = installmentsCount === 1 && !customerId;

      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date();
        if (!isPaidUpfront) {
           dueDate.setMonth(dueDate.getMonth() + i);
        }

        installmentsData.push({
          number: i,
          value: installmentValue,
          dueDate: dueDate,
          paidAt: isPaidUpfront ? new Date() : null 
        });
      }

      const sale = await tx.sale.create({
        data: {
          total: totalSale,
          customerId: customerId ? Number(customerId) : null,
          observation,
          items: { create: saleItemsData },
          installments: { create: installmentsData }
        },
        include: {
          items: true,
          installments: true
        }
      });

      return sale;
    });

    return res.status(201).json(result);

  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Erro ao realizar venda." });
  }
}

export async function getRecent(_req: Request, res: Response) {
  try {
    const sales = await prisma.sale.findMany({
      take: 20,
      orderBy: { date: 'desc' },
      include: {
        customer: { select: { name: true } },
        items: {
          include: { product: { select: { name: true } } }
        },
        installments: true
      }
    });
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar vendas." });
  }
}