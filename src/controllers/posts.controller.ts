import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import * as postsService from "../services/posts.service";
import { AuthenticatedRequest } from "../types/interfaces";

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const authorId = (req as AuthenticatedRequest).user._id;

    const newPost = await postsService.createPostService({
      authorId: authorId.toString(),
      imageUrl: `/uploads/${file.filename}`,
      caption,
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username } = req.params;

    const posts = await postsService.getUserPostsService(username);
    if (!posts) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const getPostByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = req.params.postId;
    const post = await postsService.getPostByIdService(postId);

    if (!post) return res.status(404).json({ message: "Пост не найден" });

    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const getExplorePosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const posts = await postsService.getExplorePostsService();
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const likePostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const userId = (req as AuthenticatedRequest).user._id;

    const likesCount = await postsService.likePost(postId, userId.toString());
    res.json({ likesCount });
  } catch (err) {
    next(err);
  }
};

export const unlikePostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const userId = (req as AuthenticatedRequest).user._id;

    const likesCount = await postsService.unlikePost(postId, userId.toString());
    res.status(200).json({ likes: likesCount });
  } catch (err) {
    next(err);
  }
};

export const likeCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;

    const likesCount = await postsService.likeComment(
      req.params.commentId,
      userId.toString(),
    );
    res.status(200).json({ message: "Поставлен лайк", likesCount });
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
    const userId = (req as AuthenticatedRequest).user._id;

    const likesCount = await postsService.unlikeComment(
      req.params.commentId,
      userId.toString(),
    );
    res.status(200).json({ message: "Лайк удалён", likesCount });
  } catch (error) {
    next(error);
  }
};

export const deletePostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const userId = (req as AuthenticatedRequest).user._id;

    const success = await postsService.deletePost(postId, userId.toString());

    if (!success) {
      return res.status(403).json({ message: "Нет прав на удаление поста" });
    }

    res.status(200).json({ message: "Пост удалён" });
  } catch (error) {
    next(error);
  }
};

export const editPostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;
    const userId = (req as AuthenticatedRequest).user._id;

    const updatedPost = await postsService.editPost(
      postId,
      caption,
      userId.toString(),
    );
    if (!updatedPost) {
      return res.status(403).json({ message: "Нет доступа к редактированию" });
    }

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export async function getFeedPostsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = (req as AuthenticatedRequest).user._id;

    const feedPosts = await postsService.getFeedPostsService(userId.toString());
    res.status(200).json(feedPosts);
  } catch (error) {
    next(error);
  }
}

export const createCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params;
    const authorId = (req as AuthenticatedRequest).user._id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const comment = await postsService.createComment(
      postId,
      authorId.toString(),
      text,
    );
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};
