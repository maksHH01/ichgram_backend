import { Router } from "express";

import {
  loginController,
  getCurrentController,
  logoutController,
  refreshController,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authorization";

const authRouter: Router = Router();

authRouter.post("/login", loginController);

authRouter.post("/refresh", refreshController);

authRouter.get("/current", authenticate, getCurrentController);

authRouter.post("/logout", authenticate, logoutController);

export default authRouter;
