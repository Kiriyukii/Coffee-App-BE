import express from 'express';

import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import {
  editBean,
  getAllBean,
  getBeanById,
  getFavoriteBeans,
  patchBeanStatus,
  uploadBean,
} from '../controllers/bean.controller';

const beanRouter = express.Router();

beanRouter.post(
  '/create-bean',
  isAuthenticated,
  authorizeRoles('admin'),
  uploadBean
);

beanRouter.put(
  '/edit-bean/:id',
  isAuthenticated,
  authorizeRoles('admin'),
  editBean
);

beanRouter.get('/get-bean/:id', getBeanById);
beanRouter.get('/get-beans', getAllBean);
beanRouter.get('/get-favorite-beans', getFavoriteBeans);
beanRouter.patch('/patch-bean/:id', isAuthenticated, patchBeanStatus);

export default beanRouter;
