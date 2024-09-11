import { NextFunction, Request, Response } from 'express';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import ErrorHandler from '../utils/ErrorHandler';
import cloudinary from 'cloudinary';
import { redis } from '../utils/redis';
import { createBean } from '../services/bean.service';
import BeanModel from '../models/bean.model';

export const uploadBean = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const uploadPromises = [];
      if (data.imagelink_portrait) {
        uploadPromises.push(
          cloudinary.v2.uploader
            .upload(data.imagelink_portrait, {
              folder: 'beans',
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
              folder: 'beans',
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
      createBean(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editBean = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const beanId = req.params.id;
      const existingBean = (await BeanModel.findById(beanId)) as any;
      const uploadPromises = [];
      if (
        data.imagelink_portrait &&
        existingBean?.imagelink_portrait?.public_id
      ) {
        uploadPromises.push(
          (async () => {
            await cloudinary.v2.uploader.destroy(
              existingBean.imagelink_portrait.public_id
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
      if (data.imagelink_square && existingBean?.imagelink_square?.public_id) {
        uploadPromises.push(
          (async () => {
            await cloudinary.v2.uploader.destroy(
              existingBean.imagelink_square.public_id
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

      const bean = await BeanModel.findByIdAndUpdate(
        beanId,
        { $set: data },
        { new: true }
      );
      res.status(201).json({
        success: true,
        bean,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//get bean info
export const getBeanById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const beanId = req.params.id;
      const isCacheExist = await redis.get(beanId);

      if (isCacheExist) {
        const bean = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          bean,
        });
      } else {
        const bean = await BeanModel.findById(beanId);
        await redis.set(beanId, JSON.stringify(bean), 'EX', 604800);
        res.status(200).json({
          success: true,
          bean,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
//get all coffee
export const getAllBean = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const beans = await BeanModel.find();
      res.status(200).json({
        success: true,
        beans,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
