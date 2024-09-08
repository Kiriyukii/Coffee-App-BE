import express from 'express';
import { editCoffee, uploadCoffee } from '../controllers/coffee.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';

const coffeeRouter = express.Router();

coffeeRouter.post(
  '/create-coffee',
  isAuthenticated,
  authorizeRoles('admin'),
  uploadCoffee
);

coffeeRouter.post(
  '/edit-coffee/:id',
  isAuthenticated,
  authorizeRoles('admin'),
  editCoffee
);

export default coffeeRouter;
