import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function seedDatabase() {
  const rawdata = fs.readFileSync('./data/countries.json');
  const { countries } = JSON.parse(rawdata.toString());

  const gameState = await prisma.gameState.create({
    data: { turn: 1 },
  });

  for (const country of countries) {
    const newCountry = await prisma.country.create({
      data: {
        name: country,
        resources: Math.floor(Math.random() * 100),
        gameState: { connect: { id: gameState.id } },
      },
    });
    console.log(`Created ${newCountry.name}`);
  }

  console.log('Finished seeding the database!');
}

seedDatabase()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
