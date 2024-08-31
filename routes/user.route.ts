import { isAuthenticated } from '../middleware/auth';
import {
  activateUser,
  loginUser,
  logoutUser,
  registrationUser,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
} from './../controllers/user.controller';
import express from 'express';

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);
userRouter.post('/activate-user', activateUser);
userRouter.post('/login', loginUser);
userRouter.get('/logout', isAuthenticated, logoutUser);
userRouter.get('/refresh', updateAccessToken);
userRouter.get('/me', isAuthenticated, updateAccessToken);
userRouter.put('/update-user-info', isAuthenticated, updateUserInfo);
userRouter.put('/update-user-password', isAuthenticated, updatePassword);
userRouter.put(
  '/update-profile-picture',
  isAuthenticated,
  updateProfilePicture
);

export default userRouter;
