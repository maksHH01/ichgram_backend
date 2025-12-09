"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const server_1 = __importDefault(require("./server"));
const connectDatabase_1 = __importDefault(require("./db/connectDatabase"));
const websocketServer_1 = __importDefault(require("./websocketServer"));
const bootstrap = async () => {
    try {
        await (0, connectDatabase_1.default)();
        (0, server_1.default)();
        (0, websocketServer_1.default)();
    }
    catch (error) {
        console.error("Fatal error during startup:");
        console.error(error);
        process.exit(1);
    }
};
bootstrap();
