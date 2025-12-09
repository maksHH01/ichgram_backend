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
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeCommentController = exports.likeCommentController = exports.deleteCommentController = exports.getCommentsByPostController = void 0;
const commentsService = __importStar(require("../services/comments.service"));
const getCommentsByPostController = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await commentsService.getCommentsByPost(postId);
        res.json(comments);
    }
    catch (error) {
        console.error("Get comments error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getCommentsByPostController = getCommentsByPostController;
const deleteCommentController = async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const userId = String(req.user._id);
        const success = await commentsService.deleteComment(postId, commentId, userId);
        if (!success) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        res.json({ message: "Comment deleted" });
    }
    catch (error) {
        if (error.message === "Unauthorized") {
            return res.status(403).json({ message: error.message });
        }
        console.error("Delete comment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteCommentController = deleteCommentController;
const likeCommentController = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = String(req.user._id);
        const updatedComment = await commentsService.likeComment(commentId, userId);
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json(updatedComment);
    }
    catch (error) {
        console.error("Like comment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.likeCommentController = likeCommentController;
const unlikeCommentController = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = String(req.user._id);
        const updatedComment = await commentsService.unlikeComment(commentId, userId);
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.json(updatedComment);
    }
    catch (error) {
        console.error("Unlike comment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.unlikeCommentController = unlikeCommentController;
