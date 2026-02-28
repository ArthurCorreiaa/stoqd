import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function pay(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const installment = await prisma.installment.findUnique({
      where: { id: Number(id) }
    });

    if (!installment) {
      return res.status(404).json({ error: "Parcela não encontrada" });
    }

    if (installment.paidAt) {
      return res.status(400).json({ error: "Esta parcela já foi paga!" });
    }

    const updatedInstallment = await prisma.installment.update({
      where: { id: Number(id) },
      data: { paidAt: new Date() }
    });

    return res.json(updatedInstallment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao registrar o pagamento da parcela" });
  }
}