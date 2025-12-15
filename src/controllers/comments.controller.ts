import { Request, Response, NextFunction } from "express";
import * as commentsService from "../services/comments.service";
import { AuthenticatedRequest } from "../types/interfaces";

export const getCommentsByPostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const comments = await commentsService.getCommentsByPost(postId);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const deleteCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId, commentId } = req.params;

    const userId = (req as AuthenticatedRequest).user._id;

    await commentsService.deleteComment(postId, commentId, userId.toString());

    res.json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};

export const likeCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;
    const userId = (req as AuthenticatedRequest).user._id;

    const updatedComment = await commentsService.likeComment(
      commentId,
      userId.toString(),
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};

export const unlikeCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { commentId } = req.params;
    const userId = (req as AuthenticatedRequest).user._id;

    const updatedComment = await commentsService.unlikeComment(
      commentId,
      userId.toString(),
    );

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.json(updatedComment);
  } catch (error) {
    next(error);
  }
};
