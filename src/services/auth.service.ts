// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";

// import User, { IUser } from "../db/User";
// import HttpExeption from "../utils/HttpExeption";

// import { Login } from "../validation/auth.schema";
// import { toUserDto } from "../types/toUserDto";
// import { IUserDto } from "../types/interfaces";

// const { JWT_SECRET = "devsecret" } = process.env;

// export interface ILoginResponse {
//   token: string;
//   user: IUserDto;
// }

// export interface IJWTTokenPayload {
//   id: string;
// }

// const createToken = (user: IUser): string => {
//   const payload: IJWTTokenPayload = {
//     id: user._id.toString(),
//   };

//   const token = jwt.sign(payload, JWT_SECRET, {
//     expiresIn: "24h",
//   });

//   return token;
// };

// export const login = async ({
//   identifier,
//   password,
// }: Login): Promise<ILoginResponse> => {
//   const user = (await User.findOne({
//     $or: [{ email: identifier }, { username: identifier }],
//   })) as IUser | null;

//   if (!user) {
//     throw HttpExeption(401, `User with identifier ${identifier} not exist`);
//   }

//   if (!user.verify) {
//     throw HttpExeption(403, "Please verify your email before logging in");
//   }

//   const isPasswordValid = await bcrypt.compare(password, user.password);

//   if (!isPasswordValid) {
//     throw HttpExeption(401, "Password invalid");
//   }

//   const token = createToken(user);

//   user.token = token;

//   await user.save({ validateBeforeSave: false });

//   return {
//     token,
//     user: toUserDto(user),
//   };
// };

// export const getCurrent = async (user: IUser): Promise<ILoginResponse> => {
//   return {
//     token: user.token!,
//     user: toUserDto(user),
//   };
// };

// export const logout = async (user: IUser): Promise<void> => {
//   if (!user || !user._id) {
//     return;
//   }

//   await User.findByIdAndUpdate(user._id, { token: "" });
// };

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User, { IUser } from "../db/User";
import HttpExeption from "../utils/HttpExeption";

import { Login } from "../validation/auth.schema";
import { toUserDto } from "../types/toUserDto";
import { IUserDto } from "../types/interfaces";

// Берем секреты из переменных окружения
const {
  JWT_ACCESS_SECRET = "access_secret",
  JWT_REFRESH_SECRET = "refresh_secret",
} = process.env;

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: IUserDto;
}

// Вспомогательная функция для генерации пары токенов
const generateTokens = (userId: string) => {
  const payload = { id: userId };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: "30m",
  }); // 30 минут
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  }); // 30 дней

  return { accessToken, refreshToken };
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

  // Генерируем пару
  const tokens = generateTokens(user._id.toString());

  // Сохраняем Refresh токен в базу
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return {
    ...tokens,
    user: toUserDto(user),
  };
};

// 👇 НОВАЯ ФУНКЦИЯ: Обновление токенов
export const refresh = async (
  oldRefreshToken: string,
): Promise<ILoginResponse> => {
  try {
    // 1. Проверяем валидность присланного рефреш-токена
    const { id } = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET) as {
      id: string;
    };

    // 2. Ищем юзера
    const user = (await User.findById(id)) as IUser | null;

    // 3. Проверки безопасности: юзер есть? токен совпадает с тем, что в базе?
    if (!user || user.refreshToken !== oldRefreshToken) {
      throw HttpExeption(403, "Invalid refresh token");
    }

    // 4. Генерируем НОВУЮ пару (Token Rotation)
    const tokens = generateTokens(user._id.toString());

    // 5. Обновляем базу
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });

    return {
      ...tokens,
      user: toUserDto(user),
    };
  } catch (error) {
    throw HttpExeption(403, "Refresh token expired or invalid");
  }
};

export const getCurrent = async (user: IUser): Promise<ILoginResponse> => {
  // В getCurrent мы не генерируем новые токены, просто возвращаем данные
  // Access токен уже проверен в middleware
  return {
    accessToken: "", // Можно не возвращать, фронт использует текущий
    refreshToken: "",
    user: toUserDto(user),
  };
};

export const logout = async (user: IUser): Promise<void> => {
  if (!user || !user._id) {
    return;
  }
  // Удаляем рефреш токен
  await User.findByIdAndUpdate(user._id, { refreshToken: "" });
};
