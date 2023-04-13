import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import canvasAPI from 'node-canvas-api';

dotenv.config();

export async function getCourses(req: Request, res: Response, next: NextFunction) {
  const { slug } = req.params;

  const response = canvasAPI.getSelf().then((self) => console.log(self));

  //   const department = await getDepartmentBySlug(slug);

  //   if (!department) {
  //     return next();
  //   }

  //   const courses = await getCoursesByDepartmentId(department.id);

  //   if (!courses) {
  //     return next(new Error('unable to get courses'));
  //   }

  return res.status(200).json(response);
}
