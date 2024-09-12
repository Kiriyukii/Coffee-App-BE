import express from 'express';
import {
  editCoffee,
  getAllCoffee,
  getCoffeeById,
  getFavoriteCoffee,
  patchCoffeeStatus,
  uploadCoffee,
} from '../controllers/coffee.controller';
import { authorizeRoles, isAuthenticated } from '../middleware/auth';

const coffeeRouter = express.Router();

coffeeRouter.post(
  '/create-coffee',
  isAuthenticated,
  authorizeRoles('admin'),
  uploadCoffee
);

coffeeRouter.put(
  '/edit-coffee/:id',
  isAuthenticated,
  authorizeRoles('admin'),
  editCoffee
);

coffeeRouter.get('/get-coffee/:id', getCoffeeById);
coffeeRouter.get('/get-coffees', getAllCoffee);
coffeeRouter.get('/get-favorite-coffees', getFavoriteCoffee);
coffeeRouter.patch('/patch-coffee/:id', isAuthenticated, patchCoffeeStatus);

export default coffeeRouter;
