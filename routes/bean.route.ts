import express from 'express';

import { authorizeRoles, isAuthenticated } from '../middleware/auth';
import {
  editBean,
  getAllBean,
  getBeanById,
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

export default beanRouter;
