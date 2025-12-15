import express from "express";
import cors from "cors";
import path from "path";
import http from "node:http";
import { Server, Socket } from "socket.io";
import { ChangeStreamDocument } from "mongodb";

import notFoundHandler from "./middlewares/notFoundHandler";
import errorHandler from "./middlewares/errorHandler";

import userRouter from "./routes/user.router";
import authRouter from "./routes/auth.router";
import postsRouter from "./routes/posts.router";
import commentsRouter from "./routes/comments.router";
import notificationRouter from "./routes/notification.router";

import Notification from "./db/Notification";

const startServer = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../public/uploads")),
  );

  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/notifications", notificationRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket: Socket) => {
    console.log(`New frontend connected, socket id: ${socket.id}`);

    socket.on("join", (userId: string) => {
      if (userId && typeof userId === "string") {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
      } else {
        console.warn(`Socket ${socket.id} tried to join with invalid userId`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected, socket id: ${socket.id}`);
    });
  });

  Notification.watch().on("change", async (change: ChangeStreamDocument) => {
    if (change.operationType === "insert" && change.fullDocument) {
      try {
        const notificationId = change.fullDocument._id;

        const notification = await Notification.findById(notificationId)
          .populate("sender", "username avatarUrl")
          .populate("post", "imageUrl")
          .lean();

        if (notification && notification.recipient) {
          io.to(notification.recipient.toString()).emit(
            "newNotification",
            notification,
          );
        }
      } catch (err) {
        console.error("Error processing notification change:", err);
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`Server (API + WebSockets) running on port ${PORT}`);
  });
};

export default startServer;
