import { PrismaClient, User } from '@prisma/client';
import { Request, Response } from 'express';
import { seedDatabase } from '../setup/setupGame.js';
import { requireAuthentication } from './users.js';

const prisma = new PrismaClient();

export async function handleReset(req: Request, res: Response) {
  const user = req.user as User;
  const gameState = await prisma.gameState.delete({
    where: { userId: user.id },
    include: { countries: true, playerCountry: true },
  });

  if (!gameState) {
    return res.status(500).json({ errors: 'Unsuccesfully reset game state' });
  }

  await seedDatabase(user.id);

  return res.status(204).json({ message: 'Succesfully reset game state' });
}

export const reset = [requireAuthentication, handleReset];

export async function getGamestateForUser(req: Request, res: Response) {
  const user = req.user as User;
  const gameState = await prisma.gameState.findUnique({
    where: { userId: user.id },
    include: { countries: true, playerCountry: true },
  });

  return res.status(200).json(gameState);
}

export const getGamestate = [requireAuthentication, getGamestateForUser];

export async function handleTurnForUser(req: Request, res: Response) {
  const { action, countryName, selectedCountryName, gameStateId } = req.body;

  const country = await prisma.country.findFirst({
    where: {
      AND: [{ name: countryName }, { gameStateId }],
    },
  });

  const selectedCountry = await prisma.country.findFirst({
    where: {
      AND: [{ name: selectedCountryName }, { gameStateId }],
    },
  });

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

            const lossGameState = await prisma.gameState.update({
              where: { id: gameStateId },
              data: { active: false },
              include: { countries: true, playerCountry: true },
            });

            return res.status(200).json(lossGameState);
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

  //   await prisma.$executeRaw`
  //   UPDATE "Country"
  //   SET resources =
  //     CASE
  //       WHEN random_action = 'buildArmy' THEN current_country.resources - 10
  //       WHEN random_action = 'buildCity' THEN current_country.resources - 20
  //       WHEN random_action = 'research' THEN current_country.resources - 30
  //       WHEN random_action = 'attack' THEN current_country.resources - 10
  //       ELSE current_country.resources
  //     END,
  //     troops =
  //     CASE
  //       WHEN random_action = 'buildArmy' THEN current_country.troops + 5
  //       WHEN random_action = 'attack' THEN
  //         CASE
  //           WHEN random() < 0.7 THEN current_country.troops - FLOOR(0.7 * current_country.troops)
  //           ELSE current_country.troops
  //         END
  //       ELSE current_country.troops
  //     END,
  //     "conqueredCountryIds" =
  //     CASE
  //       WHEN random_action = 'attack' AND random() < 0.7 THEN array_append(current_country."conqueredCountryIds", attacked_country.id)
  //       ELSE current_country."conqueredCountryIds"
  //     END,
  //     enemies =
  //     CASE
  //       WHEN random_action = 'attack' AND random() >= 0.7 THEN array_append(current_country.enemies, attacked_country.id)
  //       ELSE current_country.enemies
  //     END,
  //     "conqueringCountry" =
  //     CASE
  //       WHEN random_action = 'attack' AND random() < 0.7 THEN current_country.id
  //       ELSE current_country."conqueringCountry"
  //     END
  //   FROM (
  //     SELECT
  //       current_country.id,
  //       CASE
  //         WHEN random() < 0.25 THEN 'buildArmy'
  //         WHEN random() >= 0.25 AND random() < 0.5 THEN 'buildCity'
  //         WHEN random() >= 0.5 AND random() < 0.75 THEN 'research'
  //         WHEN random() >= 0.75 THEN 'attack'
  //       END AS random_action,
  //       (
  //         SELECT id
  //         FROM "Country"
  //         WHERE id != current_country.id
  //         ORDER BY random()
  //         LIMIT 1
  //       ) AS attacked_country_id
  //     FROM "Country" AS current_country
  //     WHERE name != ${countryName} AND name != ${selectedCountryName}
  //   ) AS random_actions
  //   JOIN "Country" AS current_country ON current_country.id = random_actions.id
  //   JOIN "Country" AS attacked_country ON attacked_country.id = random_actions.attacked_country_id
  //   WHERE "Country".id = random_actions.id;
  // `;

  await prisma.gameState.update({
    where: { id: gameStateId },
    data: {
      turn: { increment: 1 },
    },
  });

  // Get updated game state
  const gameState = await prisma.gameState.findUnique({
    where: { id: gameStateId },
    include: { countries: true, playerCountry: true },
  });

  return res.status(200).json(gameState);
}

export const handleTurn = [requireAuthentication, handleTurnForUser];
