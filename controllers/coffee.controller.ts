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
      const uploadPromises = [];
      if (data.imagelink_portrait) {
        uploadPromises.push(
          cloudinary.v2.uploader
            .upload(data.imagelink_portrait, {
              folder: 'coffees',
            })
            .then((myCloud) => {
              data.imagelink_portrait = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              };
            })
        );
      }

      if (data.imagelink_square) {
        uploadPromises.push(
          cloudinary.v2.uploader
            .upload(data.imagelink_square, {
              folder: 'coffees',
            })
            .then((myCloud) => {
              data.imagelink_square = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              };
            })
        );
      }
      await Promise.all(uploadPromises);
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
      const uploadPromises = [];
      if (
        data.imagelink_portrait &&
        existingCoffee?.imagelink_portrait?.public_id
      ) {
        uploadPromises.push(
          (async () => {
            await cloudinary.v2.uploader.destroy(
              existingCoffee.imagelink_portrait.public_id
            );
            const myCloud = await cloudinary.v2.uploader.upload(
              data.imagelink_portrait,
              { folder: 'coffees' }
            );
            data.imagelink_portrait = {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            };
          })()
        );
      }
      if (
        data.imagelink_square &&
        existingCoffee?.imagelink_square?.public_id
      ) {
        uploadPromises.push(
          (async () => {
            await cloudinary.v2.uploader.destroy(
              existingCoffee.imagelink_square.public_id
            );
            const myCloud = await cloudinary.v2.uploader.upload(
              data.imagelink_square,
              { folder: 'coffees' }
            );
            data.imagelink_square = {
              public_id: myCloud.public_id,
              url: myCloud.secure_url,
            };
          })()
        );
      }
      await Promise.all(uploadPromises);

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

export const patchCoffeeStatus = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const coffeeId = req.params.id;
      const existingCoffee = await CoffeeModel.findById(coffeeId);
      if (!existingCoffee) {
        return next(new ErrorHandler('Coffee not found', 404));
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
