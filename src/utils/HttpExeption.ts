import { HttpError } from "../types/classes";
import { StatusCode } from "../types/types";

interface IMessageList {
  [key: number]: string;
}

const messageList: IMessageList = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  500: "Server error",
};

const HttpExeption = (status: StatusCode, message = messageList[status]) => {
  const error = new HttpError(message);
  error.status = status;
  return error;
};

export default HttpExeption;
