import { Response } from 'express';
import CoffeeModel from '../models/coffee.model';
import { CatchAsyncError } from '../middleware/catchAsyncError';

//create coffee
export const createCoffee = CatchAsyncError(
  async (data: any, res: Response) => {
    const coffee = await CoffeeModel.create(data);
    res.status(201).json({
      success: true,
      coffee,
    });
  }
);
