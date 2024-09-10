import { Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import BeanModel from '../models/bean.model';

//create coffee
export const createBean = CatchAsyncError(async (data: any, res: Response) => {
  const bean = await BeanModel.create(data);
  res.status(201).json({
    success: true,
    bean,
  });
});
