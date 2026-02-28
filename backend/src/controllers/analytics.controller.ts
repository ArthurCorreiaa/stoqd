import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getDashboardSummary(_req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany();
    
    let totalStockValue = 0;
    let totalExpectedProfit = 0;
    let lowStockItems = 0;

    products.forEach(p => {
      const activePrice = p.promotionalPrice || p.sellingPrice;
      totalStockValue += activePrice * p.quantity;
      totalExpectedProfit += (activePrice - p.averageCost) * p.quantity;
      
      if (p.quantity > 0 && p.quantity <= 3) {
        lowStockItems += 1;
      }
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySales = await prisma.sale.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { total: true },
      _count: { id: true }
    });

    const dashboardData = {
      inventory: {
        totalProducts: products.length,
        totalStockValue,
        totalExpectedProfit,
        lowStockItems
      },
      sales: {
        currentMonthTotal: monthlySales._sum.total || 0,
        currentMonthCount: monthlySales._count.id || 0
      }
    };

    return res.json(dashboardData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao carregar métricas" });
  }
}