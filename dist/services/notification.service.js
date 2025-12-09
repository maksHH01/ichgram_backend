"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../db/Notification"));
const websocketServer_1 = require("../websocketServer");
const createNotification = async ({ recipient, sender, type, post, }) => {
    const notificationData = {
        recipient,
        sender,
        type,
        isRead: false,
        post: post || undefined,
    };
    const notification = new Notification_1.default(notificationData);
    const savedNotification = await notification.save();
    const populatedNotification = await Notification_1.default.findById(savedNotification._id)
        .populate("sender", "username avatarUrl")
        .populate({
        path: "post",
        select: "imageUrl",
    })
        .lean();
    websocketServer_1.io.to(recipient.toString()).emit("newNotification", populatedNotification);
    return savedNotification;
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return await Notification_1.default.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .populate("sender", "username avatarUrl")
        .populate({
        path: "post",
        select: "imageUrl",
    })
        .lean();
};
exports.getUserNotifications = getUserNotifications;
const markAsRead = async (userId) => {
    await Notification_1.default.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};
exports.markAsRead = markAsRead;
