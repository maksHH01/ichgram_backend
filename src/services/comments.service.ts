import Post from "../db/Post";
import Comment, { IComment } from "../db/Comment";
import { Types } from "mongoose";
import HttpExeption from "../utils/HttpExeption";

export const getCommentsByPost = async (postId: string) => {
  const post = await Post.findById(postId).populate({
    path: "comments",
    populate: { path: "author", select: "username avatarUrl" },
    options: { sort: { createdAt: 1 } },
  });

  if (!post) {
    throw HttpExeption(404, "Post not found");
  }

  return post.comments;
};

export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string,
) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw HttpExeption(404, "Comment not found");
  }

  if (comment.author.toString() !== userId) {
    throw HttpExeption(
      403,
      "You do not have permission to delete this comment",
    );
  }

  await comment.deleteOne();

  await Post.findByIdAndUpdate(postId, { $pull: { comments: commentId } });

  return true;
};

export const likeComment = async (
  commentId: string,
  userId: string,
): Promise<IComment> => {
  const userObjId = new Types.ObjectId(userId);

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $addToSet: { likes: userObjId } },
    { new: true },
  ).populate("author", "username avatarUrl");

  if (!comment) {
    throw HttpExeption(404, "Comment not found");
  }

  return comment;
};

export const unlikeComment = async (
  commentId: string,
  userId: string,
): Promise<IComment> => {
  const userObjId = new Types.ObjectId(userId);

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    { $pull: { likes: userObjId } },
    { new: true },
  ).populate("author", "username avatarUrl");

  if (!comment) {
    throw HttpExeption(404, "Comment not found");
  }

  return comment;
};
