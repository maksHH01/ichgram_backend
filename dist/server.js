"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const node_http_1 = __importDefault(require("node:http"));
const socket_io_1 = require("socket.io");
const notFoundHandler_1 = __importDefault(require("./middlewares/notFoundHandler"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const user_router_1 = __importDefault(require("./routes/user.router"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const posts_router_1 = __importDefault(require("./routes/posts.router"));
const comments_router_1 = __importDefault(require("./routes/comments.router"));
const notification_router_1 = __importDefault(require("./routes/notification.router"));
const Notification_1 = __importDefault(require("./db/Notification"));
const startServer = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
    app.use("/api/users", user_router_1.default);
    app.use("/api/auth", auth_router_1.default);
    app.use("/api/posts", posts_router_1.default);
    app.use("/api/comments", comments_router_1.default);
    app.use("/api/notifications", notification_router_1.default);
    app.use(notFoundHandler_1.default);
    app.use(errorHandler_1.default);
    const server = node_http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
        },
        transports: ["websocket"],
    });
    io.on("connection", (socket) => {
        console.log("New frontend connected, socket id:", socket.id);
        socket.on("join", (userId) => {
            socket.join(userId);
            console.log(`Socket ${socket.id} joined room ${userId}`);
        });
        socket.on("disconnect", () => {
            console.log("User disconnected, socket id:", socket.id);
        });
    });
    Notification_1.default.watch().on("change", async (change) => {
        if (change.operationType === "insert") {
            const notification = await Notification_1.default.findById(change.fullDocument._id)
                .populate("sender", "username avatarUrl")
                .populate("post", "imageUrl")
                .lean();
            if (notification) {
                io.to(notification.recipient.toString()).emit("newNotification", notification);
            }
        }
    });
    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Server running on ${port} port`));
};
exports.default = startServer;
