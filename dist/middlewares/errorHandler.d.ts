import type { Request, Response, NextFunction } from "express";
import type { ResponseError } from "../types/interface.js";
declare const errorHandler: (error: ResponseError, req: Request, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map