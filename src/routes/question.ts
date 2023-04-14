import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

export async function createQuestion(req: Request, res: Response) {
  let location = await getRandomLocation();
  console.log(location);
  let img = await searchImage(location);
  return res.status(200).json(img);
}

// Geonames API configuration
const geonamesUsername = process.env.GEONAMES_USERNAME;

// Unsplash API configuration
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

// Function to generate a random location using Geonames
async function getRandomLocation() {
  const lat = Math.random() * 180 - 90;
  const lng = Math.random() * 360 - 180;
  const url = `http://api.geonames.org/findNearbyJSON?lat=${lat}&lng=${lng}&username=${geonamesUsername}`;

  const response = await axios.get(url);

  return response.data.geonames[0];
}

// Function to search for an image using Unsplash
async function searchImage(query) {
  // const url = `https://api.unsplash.com/search/photos?page=1&query=${query}&orientation=landscape`;
  const url = `https://api.unsplash.com/photos/random?query=${query.countryName}&content_filter=high&count=10&longitude=${query.lng}&latitude=${query.lat}`;
  const headers = {
    Authorization: `Client-ID ${unsplashAccessKey}`,
  };

  const response = await axios.get(url, { headers });

  return response.data.results[0];
}
