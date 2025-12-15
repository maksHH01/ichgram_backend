import { Request, Response, NextFunction } from "express";
import * as usersService from "../services/user.service";

import validateBody from "../utils/validateBody";
import {
  userAddSchema,
  verifyCodeSchema,
  resetPasswordSchema,
} from "../validation/users.schema";

import { AuthenticatedRequest } from "../types/interfaces";

export const registerUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await validateBody(userAddSchema, req.body);

    await usersService.registerUser(req.body);

    res.status(201).json({
      message: "User succeffully register. Please confirm email with link",
    });
  } catch (error) {
    next(error);
  }
};

export const checkEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const exists = await usersService.checkEmailExists(email);
    res.json({ exists });
  } catch (error) {
    next(error);
  }
};

export const checkUsernameController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "Username is required" });
    }

    const exists = await usersService.checkUsernameExists(username);
    res.json({ exists });
  } catch (error) {
    next(error);
  }
};

export const verifyController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await validateBody(verifyCodeSchema, req.body);
    await usersService.verify(req.body.code);

    res.status(200).json({
      message: "User successfully verified",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = req.params.username;
    const user = await usersService.getUserProfileService(username);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const user = await usersService.getUserByIdService(userId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fullname, bio, link } = req.body;

    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedFields: {
      fullname?: string;
      bio?: string;
      link?: string;
      avatarUrl?: string;
    } = { fullname, bio, link };

    if (avatarUrl) {
      updatedFields.avatarUrl = avatarUrl;
    }


    const userId = (req as AuthenticatedRequest).user._id.toString();

    const user = await usersService.updateUserProfile(userId, updatedFields);

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier, email, username } = req.body;
    const value = identifier || email || username;

    await usersService.sendPasswordResetLink(value);
    res
      .status(200)
      .json({ message: "Reset link sent to email if user exists" });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await validateBody(resetPasswordSchema, req.body);

    const { verificationCode, newPassword } = req.body;
    await usersService.resetPasswordByCode(verificationCode, newPassword);

    res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    next(error);
  }
};

export const searchUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ message: "Query is required" });
    }

    const users = await usersService.searchUsers(q);

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const followUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as AuthenticatedRequest).user._id.toString();

    await usersService.followUser(id, currentUserId);

    res.status(200).json({ message: "Подписка оформлена" });
  } catch (error) {
    next(error);
  }
};

export const unfollowUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as AuthenticatedRequest).user._id.toString();

    await usersService.unfollowUser(id, currentUserId);

    res.status(200).json({ message: "Отписка выполнена" });
  } catch (error) {
    next(error);
  }
};