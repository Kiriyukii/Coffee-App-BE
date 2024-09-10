import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';
import cloudinary from 'cloudinary';
import { createCoffee } from '../services/coffee.service';
import CoffeeModel from '../models/coffee.model';
import { redis } from '../utils/redis';

export const uploadCoffee = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const imagelink_portrait = data.imagelink_portrait;
      const imagelink_square = data.imagelink_square;
      if (imagelink_portrait) {
        const myCloud = await cloudinary.v2.uploader.upload(
          imagelink_portrait,
          {
            folder: 'coffee',
          }
        );

        data.imagelink_portrait = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (imagelink_square) {
        const myCloud = await cloudinary.v2.uploader.upload(imagelink_square, {
          folder: 'coffee',
        });

        data.imagelink_square = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCoffee(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editCoffee = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const coffeeId = req.params.id;
      const existingCoffee = (await CoffeeModel.findById(coffeeId)) as any;
      const imagelink_portrait = data.imagelink_portrait;
      const imagelink_square = data.imagelink_square;
      if (imagelink_portrait && existingCoffee?.imagelink_portrait?.public_id) {
        await cloudinary.v2.uploader.destroy(
          existingCoffee.imagelink_portrait.public_id
        );
        const myCloud = await cloudinary.v2.uploader.upload(
          imagelink_portrait,
          {
            folder: 'coffees',
          }
        );

        data.imagelink_portrait = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (imagelink_square && existingCoffee?.imagelink_square?.public_id) {
        await cloudinary.v2.uploader.destroy(
          existingCoffee.imagelink_square.public_id
        );
        const myCloud = await cloudinary.v2.uploader.upload(imagelink_square, {
          folder: 'coffees',
        });

        data.imagelink_square = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const coffee = await CoffeeModel.findByIdAndUpdate(
        coffeeId,
        { $set: data },
        { new: true }
      );
      res.status(201).json({
        success: true,
        coffee,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get coffee info
export const getCoffeeById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coffeeId = req.params.id;
      const isCacheExist = await redis.get(coffeeId);

      if (isCacheExist) {
        const coffee = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          coffee,
        });
      } else {
        const coffee = await CoffeeModel.findById(coffeeId);
        await redis.set(coffeeId, JSON.stringify(coffee), 'EX', 604800);
        res.status(200).json({
          success: true,
          coffee,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
//get all coffee
export const getAllCoffee = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const coffees = await CoffeeModel.find();
      res.status(200).json({
        success: true,
        coffees,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
