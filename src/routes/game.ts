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

export async function handleTurn(req: Request, res: Response) {
  const { action, countryName, gameStateId } = req.body;

  const country = await prisma.country.findUnique({ where: { name: countryName } });

  if (!country) {
    throw new Error(`Country ${countryName} not found`);
  }

  // Update game state based on player's action
  switch (action) {
    case 'buildArmy':
      await prisma.country.update({
        where: { id: country.id },
        data: { resources: { decrement: 10 } },
      });
      break;
    case 'buildCity':
      await prisma.country.update({
        where: { id: country.id },
        data: { resources: { decrement: 20 } },
      });
      break;
    case 'research':
      await prisma.country.update({
        where: { id: country.id },
        data: { resources: { decrement: 30 } },
      });
      break;
    default:
  }

  // Pick a random action for each other country
  const otherCountries = await prisma.country.findMany({
    where: { NOT: [{ id: country.id }] },
  });

  // await prisma.$transaction(
  //   otherCountries.map((otherCountry) => {
  //     const actions = ['buildArmy', 'buildCity', 'research'];
  //     const randomAction = actions[Math.floor(Math.random() * actions.length)];

  //     switch (randomAction) {
  //       case 'buildArmy':
  //         return prisma.country.update({
  //           where: { id: otherCountry.id },
  //           data: { resources: { decrement: 10 } },
  //         });
  //       case 'buildCity':
  //         return prisma.country.update({
  //           where: { id: otherCountry.id },
  //           data: { resources: { decrement: 20 } },
  //         });
  //       case 'research':
  //         return prisma.country.update({
  //           where: { id: otherCountry.id },
  //           data: { resources: { decrement: 30 } },
  //         });
  //       default:
  //     }
  //   })
  // );

  const otherCountryIds = otherCountries.map((otherCountry) => otherCountry.id);

  await prisma.$executeRaw`
    UPDATE "Country"
    SET resources = resources -
      CASE
        WHEN random() < 0.33 THEN 10
        WHEN random() < 0.67 THEN 20
        ELSE 30
      END
    WHERE id = ANY(${otherCountryIds}::int[])
    `;

  await prisma.gameState.update({
    where: { id: gameStateId },
    data: { turn: { increment: 1 } },
  });

  // Get updated game state
  const gameState = await prisma.gameState.findUnique({
    where: { id: gameStateId },
    include: { countries: true, playerCountry: true },
  });

  return res.status(200).json(gameState);
}
