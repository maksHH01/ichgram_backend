"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unlikeComment = exports.likeComment = exports.deleteComment = exports.getCommentsByPost = void 0;
const Post_1 = __importDefault(require("../db/Post"));
const Comment_1 = __importDefault(require("../db/Comment"));
const mongoose_1 = require("mongoose");
const getCommentsByPost = async (postId) => {
    const post = await Post_1.default.findById(postId).populate({
        path: "comments",
        populate: { path: "author", select: "username avatarUrl" },
        options: { sort: { createdAt: 1 } },
    });
    if (!post)
        throw new Error("Post not found");
    return post.comments;
};
exports.getCommentsByPost = getCommentsByPost;
const deleteComment = async (postId, commentId, userId) => {
    const userObjId = new mongoose_1.Types.ObjectId(userId);
    const comment = await Comment_1.default.findById(commentId);
    if (!comment)
        throw new Error("Comment not found");
    if (comment.author.toString() !== userObjId.toString())
        throw new Error("Unauthorized");
    await comment.deleteOne();
    await Post_1.default.findByIdAndUpdate(postId, { $pull: { comments: commentId } });
    return true;
};
exports.deleteComment = deleteComment;
const likeComment = async (commentId, userId) => {
    const userObjId = new mongoose_1.Types.ObjectId(userId);
    const comment = await Comment_1.default.findByIdAndUpdate(commentId, { $addToSet: { likes: userObjId } }, { new: true }).populate("author", "username avatarUrl");
    return comment;
};
exports.likeComment = likeComment;
const unlikeComment = async (commentId, userId) => {
    const userObjId = new mongoose_1.Types.ObjectId(userId);
    const comment = await Comment_1.default.findByIdAndUpdate(commentId, { $pull: { likes: userObjId } }, { new: true }).populate("author", "username avatarUrl");
    return comment;
};
exports.unlikeComment = unlikeComment;
