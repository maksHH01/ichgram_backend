import { Request, Response, NextFunction } from "express";
import * as notificationsService from "../services/notification.service";
import { AuthenticatedRequest } from "../types/interfaces";
import { Types } from "mongoose";

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as AuthenticatedRequest).user;

    const userId = new Types.ObjectId(currentUser._id.toString());

    const notifications = await notificationsService.getUserNotifications(
      userId,
    );

    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as AuthenticatedRequest).user;
    const userId = new Types.ObjectId(currentUser._id.toString());

    await notificationsService.markAsRead(userId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
