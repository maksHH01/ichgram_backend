import type { Request, Response, NextFunction } from "express";
import type { ResponseError } from "../types/interface.js";

const errorHandler = (
  error: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const status = error.status ?? 500;
  const message = error.message ?? "Server error";

  res.status(status).json({ message });
};

export default errorHandler;
