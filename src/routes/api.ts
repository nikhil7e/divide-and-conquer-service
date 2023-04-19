import express, { Request, Response } from 'express';
import { getGamestate, handleTurn, reset } from './game.js';
import { login, signup } from './users.js';

export const router = express.Router();

export async function index(req: Request, res: Response) {
  return res.json([
    {
      href: '/departments',
      methods: ['GET', 'POST'],
    },
    {
      href: '/departments/:slug',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
    {
      href: '/departments/:slug/courses',
      methods: ['GET', 'POST'],
    },
    {
      href: '/departments/:slug/courses/:courseId',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
  ]);
}

// game
router.get('/gamestate', getGamestate);
router.post('/turn', handleTurn);
router.get('/reset', reset);

// Users
router.post('/login', login);
router.post('/signup', signup);
