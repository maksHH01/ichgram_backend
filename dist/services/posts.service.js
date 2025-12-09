"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editPost = exports.deletePost = exports.createComment = exports.unlikeComment = exports.likeComment = exports.unlikePost = exports.likePost = exports.getExplorePostsService = exports.getPostByIdService = exports.getUserPostsService = exports.createPostService = void 0;
exports.getFeedPostsService = getFeedPostsService;
const Post_1 = __importDefault(require("../db/Post"));
const User_1 = __importDefault(require("../db/User"));
const Comment_1 = __importDefault(require("../db/Comment"));
const mongoose_1 = require("mongoose");
const notification_service_1 = require("./notification.service");
const toObjectId = (id) => typeof id === "string" ? new mongoose_1.Types.ObjectId(id) : id;
const createPostService = async ({ authorId, imageUrl, caption = "", }) => {
    return await Post_1.default.create({
        author: authorId,
        imageUrl,
        caption,
        likes: [],
        comments: [],
    });
};
exports.createPostService = createPostService;
const getUserPostsService = async (username) => {
    const user = await User_1.default.findOne({ username });
    if (!user)
        return null;
    return await Post_1.default.find({ author: user._id }).sort({ createdAt: -1 });
};
exports.getUserPostsService = getUserPostsService;
const getPostByIdService = async (postId) => {
    const post = await Post_1.default.findById(postId)
        .populate("author", "username avatarUrl")
        .populate({
        path: "comments",
        populate: [
            { path: "author", select: "username avatarUrl" },
            { path: "likes", select: "username avatarUrl" },
        ],
        options: { sort: { createdAt: 1 } },
    })
        .populate("likes", "username avatarUrl")
        .lean();
    if (!post)
        return null;
    return {
        ...post,
        author: post.author || { username: "", avatarUrl: "" },
    };
};
exports.getPostByIdService = getPostByIdService;
const getExplorePostsService = async () => {
    return await Post_1.default.aggregate([{ $sample: { size: 100 } }]);
};
exports.getExplorePostsService = getExplorePostsService;
const likePost = async (postId, userId) => {
    const post = await Post_1.default.findById(postId);
    if (!post)
        throw new Error("Пост не найден");
    const userIdObj = toObjectId(userId);
    const userIdStr = userIdObj.toString();
    if (!post.likes.some((id) => id.toString() === userIdStr)) {
        post.likes.push(userIdObj);
        await post.save();
        if (post.author.toString() !== userIdStr) {
            try {
                await (0, notification_service_1.createNotification)({
                    recipient: toObjectId(post.author),
                    sender: userIdObj,
                    type: "like",
                    post: post._id,
                });
            }
            catch (err) {
                console.error("Failed to create notification (likePost):", err);
            }
        }
    }
    return post.likes.length;
};
exports.likePost = likePost;
const unlikePost = async (postId, userId) => {
    const post = await Post_1.default.findById(postId);
    if (!post)
        throw new Error("Пост не найден");
    const userIdStr = userId.toString();
    post.likes = post.likes.filter((id) => id.toString() !== userIdStr);
    await post.save();
    return post.likes.length;
};
exports.unlikePost = unlikePost;
const likeComment = async (commentId, userId) => {
    const comment = await Comment_1.default.findById(commentId);
    if (!comment)
        throw new Error("Комментарий не найден");
    const userIdObj = toObjectId(userId);
    const userIdStr = userIdObj.toString();
    if (!comment.likes.some((id) => id.toString() === userIdStr)) {
        comment.likes.push(userIdObj);
        await comment.save();
        if (comment.author.toString() !== userIdStr) {
            try {
                const post = await Post_1.default.findOne({ comments: comment._id }).select("_id");
                if (post) {
                    await (0, notification_service_1.createNotification)({
                        recipient: toObjectId(comment.author),
                        sender: userIdObj,
                        type: "likeOnComment",
                        post: post._id,
                    });
                }
            }
            catch (err) {
                console.error("Failed to create notification (likeComment):", err);
            }
        }
    }
    return comment.likes.length;
};
exports.likeComment = likeComment;
const unlikeComment = async (commentId, userId) => {
    const comment = await Comment_1.default.findById(commentId);
    if (!comment)
        throw new Error("Комментарий не найден");
    comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    await comment.save();
    return comment.likes.length;
};
exports.unlikeComment = unlikeComment;
const createComment = async (postId, authorId, text) => {
    const authorObjId = toObjectId(authorId);
    const comment = new Comment_1.default({
        author: authorObjId,
        text,
        likes: [],
    });
    await comment.save();
    const post = await Post_1.default.findById(postId);
    await Post_1.default.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    if (post && post.author.toString() !== authorId) {
        try {
            await (0, notification_service_1.createNotification)({
                recipient: toObjectId(post.author),
                sender: authorObjId,
                type: "comment",
                post: post._id,
            });
        }
        catch (err) {
            console.error("Failed to create notification (createComment):", err);
        }
    }
    return await Comment_1.default.findById(comment._id).populate("author", "username avatarUrl");
};
exports.createComment = createComment;
const deletePost = async (postId, userId) => {
    const post = await Post_1.default.findById(postId);
    if (!post)
        return false;
    if (post.author.toString() !== userId.toString())
        return false;
    await Post_1.default.deleteOne({ _id: postId });
    return true;
};
exports.deletePost = deletePost;
const editPost = async (postId, newCaption, userId) => {
    const post = await Post_1.default.findById(postId);
    if (!post || post.author.toString() !== userId.toString())
        return null;
    post.caption = newCaption;
    await post.save();
    return post;
};
exports.editPost = editPost;
async function getFeedPostsService(userId) {
    return await Post_1.default.find({})
        .sort({ createdAt: -1 })
        .populate("author", "username avatarUrl")
        .exec();
}
