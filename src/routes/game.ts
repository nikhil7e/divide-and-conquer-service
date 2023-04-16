import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export async function getGamestate(req: Request, res: Response) {
  const gameState = await prisma.gameState.findUnique({
    where: { id: 1 },
    include: { countries: true, playerCountry: true },
  });

  return res.status(200).json(gameState);
}
