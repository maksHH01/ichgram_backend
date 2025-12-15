import Notification, { INotification } from "../db/Notification";
import { Types } from "mongoose";

interface CreateNotificationParams {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type: "like" | "comment" | "follow" | "likeOnComment";
  post?: Types.ObjectId;
}

export const createNotification = async ({
  recipient,
  sender,
  type,
  post,
}: CreateNotificationParams): Promise<INotification> => {
  const notificationData: Partial<INotification> = {
    recipient,
    sender,
    type,
    isRead: false,
    post: post || undefined,
  };

  const notification = new Notification(notificationData);
  const savedNotification = await notification.save();

  return savedNotification;
};

export const getUserNotifications = async (
  userId: Types.ObjectId,
): Promise<INotification[]> => {
  return await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .populate("sender", "username avatarUrl")
    .populate({
      path: "post",
      select: "imageUrl",
    })
    .lean();
};

export const markAsRead = async (userId: Types.ObjectId): Promise<void> => {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );
};
