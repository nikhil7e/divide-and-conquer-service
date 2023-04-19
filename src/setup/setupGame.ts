import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

export async function seedDatabase(userId: number) {
  const rawdata = fs.readFileSync('./data/countries.json');
  const { countries } = JSON.parse(rawdata.toString());

  const gameState = await prisma.gameState.create({
    data: {
      turn: 1,
      user: { connect: { id: userId } },
    },
  });

  const randomIndex = Math.floor(Math.random() * countries.length);
  const playerCountryName = countries[randomIndex];

  for (const country of countries) {
    try {
      const newCountry = await prisma.country.create({
        data: {
          name: country,
          resources: Math.floor(Math.random() * 100),
          troops: Math.floor(Math.random() * 50),
          gameState: { connect: { id: gameState.id } },
        },
      });
      console.log(`Created ${newCountry.name}`);

      if (country === playerCountryName) {
        await prisma.gameState.update({
          where: { id: gameState.id },
          data: { playerCountry: { connect: { id: newCountry.id } } },
        });
        console.log(`Assigned ${newCountry.name} as player's home country`);
      }
    } catch (e) {
      console.log(e);
    }
  }

  console.log('Finished seeding the database!');
  prisma.$disconnect();
}

// seedDatabase()
//   .catch((e) => console.error(e))
//   .finally(() => prisma.$disconnect());
