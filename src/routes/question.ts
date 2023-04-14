import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

dotenv.config();

export async function createQuestion(req: Request, res: Response) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const latestEntry = await prisma.question.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
        lt: endOfToday,
      },
    },
  });

  console.log('HERE!!');

  // If there is an existing entry for today, return it
  if (latestEntry && latestEntry.length > 0) {
    console.log('Exists!!');
    return res.status(200).json(latestEntry);
  }

  let location = await getRandomLocation();
  console.log(location);
  let img = await searchImage(location);

  let createdQuestion = await prisma.question.create({
    data: {
      imageUrl: img.urls.full,
      latitude: Number.parseFloat(location.lat),
      longitude: Number.parseFloat(location.lng),
      country: location.countryName,
      fCodeName: location.fcodeName,
      toponymName: location.toponymName,
      closestPlace: location.name,
      population: location.population,
      featureClass: location.fcl,
    },
  });

  if (!createdQuestion) {
    return res.status(500).json('Could not create question');
  }

  return res.status(200).json(createdQuestion);
}

// Geonames API configuration
const geonamesUsername = process.env.GEONAMES_USERNAME;

// Unsplash API configuration
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

// Function to generate a random location using Geonames
async function getRandomLocation() {
  let lat = Math.random() * 180 - 90;
  let lng = Math.random() * 360 - 180;
  let url = `http://api.geonames.org/findNearbyJSON?lat=${lat}&lng=${lng}&username=${geonamesUsername}`;

  let response = await axios.get(url);

  while (response.data.geonames.length <= 0 || !response.data.geonames[0].countryName) {
    lat = Math.random() * 180 - 90;
    lng = Math.random() * 360 - 180;
    url = `http://api.geonames.org/findNearbyJSON?lat=${lat}&lng=${lng}&username=${geonamesUsername}`;

    response = await axios.get(url);
  }

  return response.data.geonames[0];
}

// Function to search for an image using Unsplash
async function searchImage(query) {
  // const url = `https://api.unsplash.com/search/photos?page=1&query=${query}&orientation=landscape`;
  const url = `https://api.unsplash.com/photos/random?query=${query.countryName}&content_filter=high&count=1&longitude=${query.lng}&latitude=${query.lat}`;
  const headers = {
    Authorization: `Client-ID ${unsplashAccessKey}`,
  };

  const response = await axios.get(url, { headers });

  return response.data[0];
}
