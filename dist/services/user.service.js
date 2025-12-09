"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowUser = exports.followUser = exports.searchUsers = exports.updateUserProfile = exports.getUserByIdService = exports.getUserProfileService = exports.resetPasswordByCode = exports.sendPasswordResetLink = exports.verify = exports.checkUsernameExists = exports.checkEmailExists = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const nanoid_1 = require("nanoid");
const User_1 = __importDefault(require("../db/User"));
const mongoose_1 = require("mongoose");
const sendEmailWithMailgun_1 = __importDefault(require("../utils/sendEmailWithMailgun"));
const HttpExeption_1 = __importDefault(require("../utils/HttpExeption"));
const generateVerificationCode_1 = require("../utils/generateVerificationCode");
const notification_service_1 = require("./notification.service");
const { FRONTEND_URL } = process.env;
const registerUser = async (data) => {
    const { email, fullname, username, password } = data;
    const userByEmail = await User_1.default.findOne({ email });
    if (userByEmail)
        throw (0, HttpExeption_1.default)(409, `Email ${email} is already registered`);
    const userByUsername = await User_1.default.findOne({ username });
    if (userByUsername)
        throw (0, HttpExeption_1.default)(409, `Username ${username} is already taken`);
    const hashPassword = await bcrypt_1.default.hash(password, 10);
    const verificationCode = (0, nanoid_1.nanoid)();
    const newUser = await User_1.default.create({
        ...data,
        password: hashPassword,
        verificationCode,
    });
    const verifyEmail = {
        to: [email],
        subject: "Verify your email on Ichgram",
        html: `<a href="${FRONTEND_URL}/verify?verificationCode=${verificationCode}" target="_blank">
             Click to verify your email address on Ichgram
           </a>`,
    };
    await (0, sendEmailWithMailgun_1.default)(verifyEmail);
    return newUser;
};
exports.registerUser = registerUser;
const checkEmailExists = async (email) => {
    const user = await User_1.default.findOne({ email });
    return !!user;
};
exports.checkEmailExists = checkEmailExists;
const checkUsernameExists = async (username) => {
    const user = await User_1.default.findOne({ username });
    return !!user;
};
exports.checkUsernameExists = checkUsernameExists;
const verify = async (code) => {
    const user = await User_1.default.findOne({ verificationCode: code });
    if (!user) {
        const alreadyVerified = await User_1.default.findOne({
            verify: true,
            verificationCode: "",
        });
        if (alreadyVerified)
            throw (0, HttpExeption_1.default)(400, "User already verified");
        throw (0, HttpExeption_1.default)(401, "Invalid verification code");
    }
    if (user.verify) {
        throw (0, HttpExeption_1.default)(400, "User already verified");
    }
    user.verificationCode = "";
    user.verify = true;
    await user.save();
};
exports.verify = verify;
const sendPasswordResetLink = async (identifier) => {
    if (!identifier) {
        throw (0, HttpExeption_1.default)(400, "Email или username обязателен");
    }
    const user = await User_1.default.findOne({
        $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
        throw (0, HttpExeption_1.default)(404, `User with identifier "${identifier}" not found`);
    }
    const verificationCode = (0, generateVerificationCode_1.generateVerificationCode)();
    user.verificationCode = verificationCode;
    await user.save();
    const emailData = {
        to: [user.email],
        subject: "Reset your Ichgram password",
        html: `
      <div style="font-family: sans-serif; font-size: 16px; line-height: 1.5;">
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${FRONTEND_URL}/reset-password?verificationCode=${verificationCode}" 
             target="_blank" 
             style="color: #1a73e8; text-decoration: underline;">
            Reset Password
          </a>
        </p>
      </div>
    `,
    };
    await (0, sendEmailWithMailgun_1.default)(emailData);
};
exports.sendPasswordResetLink = sendPasswordResetLink;
const resetPasswordByCode = async (verificationCode, newPassword) => {
    const user = await User_1.default.findOne({ verificationCode });
    if (!user) {
        throw (0, HttpExeption_1.default)(400, "Invalid or expired verification code");
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationCode = "";
    await user.save();
};
exports.resetPasswordByCode = resetPasswordByCode;
const getUserProfileService = async (username) => {
    const user = await User_1.default.findOne({ username })
        .select("-password -verificationCode -token -__v")
        .populate("followers", "username avatarUrl")
        .populate("following", "username avatarUrl");
    return user;
};
exports.getUserProfileService = getUserProfileService;
const getUserByIdService = async (userId) => {
    return await User_1.default.findById(userId)
        .select("-password -verificationCode -token -__v")
        .populate("followers", "username avatarUrl")
        .populate("following", "username avatarUrl");
};
exports.getUserByIdService = getUserByIdService;
const updateUserProfile = async (userId, updateData) => {
    return await User_1.default.findByIdAndUpdate(userId, updateData, {
        new: true,
    }).select("-password");
};
exports.updateUserProfile = updateUserProfile;
const searchUsers = async (query) => {
    const regex = new RegExp(query, "i");
    const users = await User_1.default.find({
        $or: [{ username: regex }, { fullname: regex }],
    }).select("_id username fullname avatarUrl");
    return users;
};
exports.searchUsers = searchUsers;
const followUser = async (targetUserId, currentUserId) => {
    if (targetUserId === currentUserId) {
        throw new Error("Нельзя подписаться на себя");
    }
    const user = await User_1.default.findById(targetUserId);
    const currentUser = await User_1.default.findById(currentUserId);
    if (!user || !currentUser) {
        throw new Error("Пользователь не найден");
    }
    if (!user.followers.some((id) => id.toString() === currentUserId)) {
        user.followers.push(currentUserId);
    }
    if (!currentUser.following.some((id) => id.toString() === targetUserId)) {
        currentUser.following.push(targetUserId);
    }
    await Promise.all([user.save(), currentUser.save()]);
    const toObjectId = (id) => typeof id === "string" ? new mongoose_1.Types.ObjectId(id) : id;
    await (0, notification_service_1.createNotification)({
        recipient: toObjectId(targetUserId),
        sender: toObjectId(currentUserId),
        type: "follow",
    });
    return user;
};
exports.followUser = followUser;
const unfollowUser = async (targetUserId, currentUserId) => {
    const user = await User_1.default.findById(targetUserId);
    const currentUser = await User_1.default.findById(currentUserId);
    if (!user || !currentUser) {
        throw new Error("Пользователь не найден");
    }
    user.followers = user.followers.filter((followerId) => followerId.toString() !== currentUserId.toString());
    currentUser.following = currentUser.following.filter((followingId) => followingId.toString() !== targetUserId.toString());
    await Promise.all([user.save(), currentUser.save()]);
    return user;
};
exports.unfollowUser = unfollowUser;
