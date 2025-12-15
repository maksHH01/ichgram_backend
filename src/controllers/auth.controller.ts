// import { Request, Response, NextFunction } from "express";

// import * as authService from "../services/auth.service";
// import validateBody from "../utils/validateBody";
// import { loginSchema } from "../validation/auth.schema";
// import { AuthenticatedRequest } from "../types/interfaces";
// import { ILoginResponse } from "../services/auth.service";

// export const loginController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     await validateBody(loginSchema, req.body);

//     const result: ILoginResponse = await authService.login(req.body);

//     res.json(result);
//   } catch (error) {
//     next(error);
//   }
// };

// export const getCurrentController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const result: ILoginResponse = await authService.getCurrent(
//       (req as AuthenticatedRequest).user
//     );

//     res.json(result);
//   } catch (error) {
//     next(error);
//   }
// };

// export const logoutController = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {

//     const user = (req as AuthenticatedRequest).user;

//     if (user) {
//       await authService.logout(user);
//     }

//     res.json({
//       message: "Logout successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

import { Request, Response, NextFunction } from "express";

import * as authService from "../services/auth.service";
import validateBody from "../utils/validateBody";
import { loginSchema } from "../validation/auth.schema";
import { AuthenticatedRequest } from "../types/interfaces";
import { ILoginResponse } from "../services/auth.service";

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await validateBody(loginSchema, req.body);

    const result: ILoginResponse = await authService.login(req.body);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// 👇 НОВЫЙ КОНТРОЛЛЕР
export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    const result: ILoginResponse = await authService.refresh(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Здесь мы просто возвращаем юзера, токены не нужны
    const result = await authService.getCurrent(
      (req as AuthenticatedRequest).user,
    );
    // Возвращаем только userDto, чтобы не путать фронт пустыми токенами
    res.json(result.user);
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = (req as AuthenticatedRequest).user;

    if (user) {
      await authService.logout(user);
    }

    res.json({
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
};
