import { Request, Response, NextFunction } from 'express';
import ErrorHandler from '../utils/ErrorHandler';
import { CatchAsyncError } from '../middleware/catchAsyncError';
import LayoutModel from '../models/layout.model';
import cloudinary from 'cloudinary';

export const createLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      const isTypeExist = await LayoutModel.findOne({ type });
      if (isTypeExist) {
        return next(new ErrorHandler(`${type} already exists`, 400));
      }
      if (type === 'Banner') {
        const { image, title, subTitle } = req.body;
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: 'layout',
        });
        const banner = {
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };

        await LayoutModel.create(banner);
      }
      if (type === 'Categories') {
        const { categories } = req.body;
        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({
          type: 'Categories',
          categories: categoriesItems,
        });
      }
      if (type === 'CoffeeType') {
        const { ctype } = req.body;
        const cTypeItems = await Promise.all(
          ctype.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.create({
          type: 'CoffeeType',
          ctype: cTypeItems,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Layout created successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const editLayout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.body;
      if (type === 'Banner') {
        const bannerData: any = await LayoutModel.findOne({ type: 'Banner' });
        const { image, title, subTitle } = req.body;
        if (bannerData) {
          await cloudinary.v2.uploader.destroy(bannerData.image.public_id);
        }
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: 'layout',
        });
        const banner = {
          type: 'Banner',
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          },
          title,
          subTitle,
        };

        await LayoutModel.findByIdAndUpdate(bannerData._id, { banner });
      }
      if (type === 'Categories') {
        const { categories } = req.body;
        const categoriesData = await LayoutModel.findOne({
          type: 'Categories',
        });
        if (!categoriesData) {
          return next(new ErrorHandler('Categories data not found', 404));
        }
        const categoriesItems = await Promise.all(
          categories.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(categoriesData?.id, {
          categories: categoriesItems,
        });
      }
      if (type === 'CoffeeType') {
        const { ctype } = req.body;
        const ctypeData = await LayoutModel.findOne({ type: 'CoffeeType' });
        const cTypeItems = await Promise.all(
          ctype.map(async (item: any) => {
            return {
              title: item.title,
            };
          })
        );
        await LayoutModel.findByIdAndUpdate(ctypeData?.id, {
          ctype: cTypeItems,
        });
      }
      res.status(200).json({
        success: true,
        message: 'Layout updated successfully',
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getLayoutByType = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const layout = await LayoutModel.findOne({ type });
      res.status(201).json({
        success: true,
        layout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
