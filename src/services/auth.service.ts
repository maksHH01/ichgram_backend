import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User, { IUser } from "../db/User";
import HttpExeption from "../utils/HttpExeption";

import { Login } from "../validation/auth.schema";
import { toUserDto } from "../types/toUserDto";
import { IUserDto } from "../types/interfaces";

const { JWT_SECRET = "devsecret" } = process.env;

export interface ILoginResponse {
  token: string;
  user: IUserDto;
}

export interface IJWTTokenPayload {
  id: string;
}

const createToken = (user: IUser): string => {
  const payload: IJWTTokenPayload = {
    id: user._id.toString(),
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });

  return token;
};

export const login = async ({
  identifier,
  password,
}: Login): Promise<ILoginResponse> => {
  const user = (await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  })) as IUser | null;

  if (!user) {
    throw HttpExeption(401, `User with identifier ${identifier} not exist`);
  }

  if (!user.verify) {
    throw HttpExeption(403, "Please verify your email before logging in");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw HttpExeption(401, "Password invalid");
  }

  const token = createToken(user);

  user.token = token;

  await user.save({ validateBeforeSave: false });

  return {
    token,
    user: toUserDto(user),
  };
};

export const getCurrent = async (user: IUser): Promise<ILoginResponse> => {
  return {
    token: user.token!,
    user: toUserDto(user),
  };
};

export const logout = async (user: IUser): Promise<void> => {
  if (!user || !user._id) {
    return;
  }

  await User.findByIdAndUpdate(user._id, { token: "" });
};
