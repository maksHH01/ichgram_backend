"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const { DATABASE_URI } = process.env;
const connectDatabase = async () => {
    try {
        if (!DATABASE_URI) {
            throw new Error("DATABASE_URI is not defined in environment variables");
        }
        await mongoose_1.default.connect(DATABASE_URI);
        console.log("Successfully connected to database");
    }
    catch (error) {
        console.error("Error connecting to database");
        console.error(error);
        throw error;
    }
};
exports.default = connectDatabase;
