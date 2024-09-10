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
      const imagelink_portrait = data.imagelink_portrait;
      const imagelink_square = data.imagelink_square;
      if (imagelink_portrait) {
        const myCloud = await cloudinary.v2.uploader.upload(
          imagelink_portrait,
          {
            folder: 'beans',
          }
        );

        data.imagelink_portrait = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (imagelink_square) {
        const myCloud = await cloudinary.v2.uploader.upload(imagelink_square, {
          folder: 'beans',
        });

        data.imagelink_square = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
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
      console.log(existingBean);
      console.log(existingBean.imagelink_portrait.public_id.type);
      const imagelink_portrait = data.imagelink_portrait;
      const imagelink_square = data.imagelink_square;
      if (imagelink_portrait && existingBean?.imagelink_portrait?.public_id) {
        await cloudinary.v2.uploader.destroy(
          existingBean.imagelink_portrait.url
        );
        const myCloud = await cloudinary.v2.uploader.upload(
          imagelink_portrait,
          {
            folder: 'beans',
          }
        );

        data.imagelink_portrait = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (imagelink_square && existingBean?.imagelink_square?.public_id) {
        await cloudinary.v2.uploader.destroy(
          existingBean.imagelink_square.public_id
        );
        const myCloud = await cloudinary.v2.uploader.upload(imagelink_square, {
          folder: 'beans',
        });

        data.imagelink_square = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

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
