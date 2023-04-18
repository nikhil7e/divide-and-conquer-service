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
  const { action, countryName, selectedCountryName, gameStateId } = req.body;

  const country = await prisma.country.findUnique({ where: { name: countryName } });
  const selectedCountry = await prisma.country.findUnique({ where: { name: selectedCountryName } });

  if (!country) {
    throw new Error(`Country ${countryName} not found`);
  }

  // Update game state based on player's action
  switch (action) {
    case 'buildArmy':
      await prisma.country.update({
        where: { id: country.id },
        data: { resources: { decrement: 10 }, troops: { increment: 5 } },
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
    case 'attack':
      if (!selectedCountry) {
        throw new Error(`Selected country ${selectedCountryName} not found`);
      }
      const randomNum = 0.7 + Math.random() * 0.3;
      const attackingTroops = Math.floor(randomNum * country.troops);
      const defendingTroops = Math.floor(randomNum * selectedCountry.troops);
      const remainingTroops = attackingTroops - defendingTroops;

      if (remainingTroops > 0) {
        // Attacker wins
        await prisma.country.update({
          where: { id: country.id },
          data: {
            troops: { set: remainingTroops },
            conqueredCountries: { connect: { id: selectedCountry.id } },
            conqueredCountryIds: { push: selectedCountry.id },
          },
        });

        // Update the losing country
        await prisma.country.update({
          where: { id: selectedCountry.id },
          data: {
            troops: { set: 1 },
            conqueredCountries: { set: [] },
            conqueredCountryIds: { set: [] },
            conqueringCountry: { connect: { id: country.id } },
          },
        });
      } else {
        // Defender wins or draw
        await prisma.country.update({
          where: { id: country.id },
          data: {
            troops: { set: 0 },
            enemies: { connect: { id: selectedCountry.id } },
          },
        });
        if (remainingTroops === 0) {
          // Draw
          await prisma.country.update({
            where: { id: selectedCountry.id },
            data: {
              troops: { set: 0 },
              enemies: { connect: { id: country.id } },
            },
          });
        } else {
          // Defender wins
          const attackerIsDefeated = await prisma.country.findUnique({
            where: { id: country.id },
            select: { troops: true },
          });
          if (attackerIsDefeated.troops === 0) {
            // Game over

            // await prisma.gameState.update({
            //   where: { id: gameStateId },
            //   data: { message: `Game over! ${countryName} has been defeated.` },
            // });

            return res
              .status(200)
              .json({ message: `Game over! Your country ${countryName} lost against ${selectedCountryName}` });
          }
        }
      }
      break;
    default:
      break;
  }

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

  // Pick a random action for each other country
  const otherCountries = await prisma.country.findMany({
    where: { NOT: [{ id: country.id }] },
  });

  const otherCountryIds = otherCountries.map((otherCountry) => otherCountry.id);

  await prisma.$executeRaw`
    UPDATE "Country"
    SET resources = resources -
      CASE
        WHEN random() < 0.70 THEN 0
        WHEN random() < 0.90 THEN 20
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
