import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function getAll(_req: Request, res: Response) {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        sales: {
          include: { 
            installments: true,
            items: true 
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const formattedCustomers = customers.map(({ id, name, phone, email, sales }) => {
      let totalDebt = 0;
      
      sales.forEach(sale => {
        sale.installments.forEach(installment => {
          if (!installment.paidAt) {
            totalDebt += installment.value;
          }
        });
      });

      return { id, name, phone, email, totalDebt, sales };
    });

    return res.json(formattedCustomers);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar clientes" });
  }
}

export async function create(req: Request, res: Response) {
  const { name, phone, email } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  try {
    const customer = await prisma.customer.create({
      data: { name, phone, email }
    });
    return res.status(201).json(customer);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar cliente" });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name, phone, email } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  try {
    const customerId = Number(id);

    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: "Cliente não encontrado." });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: { name, phone, email }
    });

    return res.json(updatedCustomer);
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return res.status(500).json({ error: "Erro interno ao atualizar cliente." });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const customerId = Number(id);

    await prisma.customer.delete({
      where: { id: customerId }
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return res.status(500).json({ error: "Erro interno ao excluir cliente." });
  }
}