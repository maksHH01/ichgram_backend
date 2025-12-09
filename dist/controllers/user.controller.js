"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowUserController = exports.followUserController = exports.searchUserController = exports.resetPasswordController = exports.changePasswordController = exports.updateUserProfileController = exports.getUserByIdController = exports.getUserProfileController = exports.verifyController = exports.checkUsernameController = exports.checkEmailController = exports.registerUserController = void 0;
const usersService = __importStar(require("../services/user.service"));
const validateBody_1 = __importDefault(require("../utils/validateBody"));
const users_schema_1 = require("../validation/users.schema");
const registerUserController = async (req, res) => {
    await (0, validateBody_1.default)(users_schema_1.userAddSchema, req.body);
    await usersService.registerUser(req.body);
    res.status(201).json({
        message: "User succeffully register. Please confirm email with link",
    });
};
exports.registerUserController = registerUserController;
const checkEmailController = async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const exists = await usersService.checkEmailExists(email);
        res.json({ exists });
    }
    catch (error) {
        console.error("Ошибка при проверке email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.checkEmailController = checkEmailController;
const checkUsernameController = async (req, res) => {
    const { username } = req.body;
    if (!username || typeof username !== "string") {
        return res.status(400).json({ message: "Username is required" });
    }
    try {
        const exists = await usersService.checkUsernameExists(username);
        res.json({ exists });
    }
    catch (error) {
        console.error("Ошибка при проверке username:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.checkUsernameController = checkUsernameController;
const verifyController = async (req, res) => {
    await (0, validateBody_1.default)(users_schema_1.verifyCodeSchema, req.body);
    await usersService.verify(req.body.code);
    res.status(200).json({
        message: "User successfully verified",
    });
};
exports.verifyController = verifyController;
const getUserProfileController = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await usersService.getUserProfileService(username);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        return res.json(user);
    }
    catch (error) {
        console.error("Ошибка при получении профиля:", error);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
};
exports.getUserProfileController = getUserProfileController;
const getUserByIdController = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await usersService.getUserByIdService(userId);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        res.json(user);
    }
    catch (error) {
        console.error("Ошибка при получении пользователя по ID:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};
exports.getUserByIdController = getUserByIdController;
const updateUserProfileController = async (req, res) => {
    try {
        const { fullname, bio, link } = req.body;
        const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
        const updatedFields = { fullname, bio, link };
        if (avatarUrl) {
            updatedFields.avatarUrl = avatarUrl;
        }
        const user = await usersService.updateUserProfile(req.user.id, updatedFields);
        res.json(user);
    }
    catch (err) {
        console.error("Ошибка при обновлении профиля:", err);
        res.status(500).json({ message: "Ошибка при обновлении профиля" });
    }
};
exports.updateUserProfileController = updateUserProfileController;
const changePasswordController = async (req, res, next) => {
    const { identifier, email, username } = req.body;
    const value = identifier || email || username;
    try {
        await usersService.sendPasswordResetLink(value);
        res
            .status(200)
            .json({ message: "Reset link sent to email if user exists" });
    }
    catch (error) {
        next(error);
    }
};
exports.changePasswordController = changePasswordController;
const resetPasswordController = async (req, res, next) => {
    try {
        await (0, validateBody_1.default)(users_schema_1.resetPasswordSchema, req.body);
        const { verificationCode, newPassword } = req.body;
        await usersService.resetPasswordByCode(verificationCode, newPassword);
        res.status(200).json({ message: "Password successfully reset" });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPasswordController = resetPasswordController;
const searchUserController = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({ message: "Query is required" });
        }
        const users = await usersService.searchUsers(q);
        res.json(users);
    }
    catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.searchUserController = searchUserController;
const followUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;
        await usersService.followUser(id, currentUserId);
        res.status(200).json({ message: "Подписка оформлена" });
    }
    catch (error) {
        const status = error.message === "Нельзя подписаться на себя" ? 400 : 404;
        res.status(status).json({ message: error.message });
    }
};
exports.followUserController = followUserController;
const unfollowUserController = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user._id;
        await usersService.unfollowUser(id, currentUserId);
        res.status(200).json({ message: "Отписка выполнена" });
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
};
exports.unfollowUserController = unfollowUserController;
