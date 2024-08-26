import { registrationUser } from './../controllers/user.controller';
import express from 'express';
const userRouter = express.Router();
userRouter.post('/registration', registrationUser);

export default userRouter;
