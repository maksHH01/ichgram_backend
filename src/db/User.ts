// import { Schema, model, Document } from "mongoose";
// import {
//   emailValidation,
//   usernameValidation,
//   fullnameValidation,
// } from "../constants/users.constants";

// export interface IUser extends Document {
//   _id: string;
//   email: string;
//   fullname: string;
//   username: string;
//   password: string;
//   token?: string;
//   verify: boolean;
//   verificationCode?: string;

//   bio?: string;
//   link?: string;
//   avatarUrl?: string;

//   followers: string[];
//   following: string[];
// }

// const userSchema = new Schema<IUser>(
//   {
//     email: {
//       type: String,
//       unique: true,
//       match: [emailValidation.value, emailValidation.message],
//       required: [true, "Email is required"],
//     },
//     fullname: {
//       type: String,
//       required: [true, "Fullname is required"],
//       minlength: [2, "Fullname must be at least 2 characters long"],
//       maxlength: [50, "Fullname cannot exceed 50 characters"],
//       match: [fullnameValidation.value, fullnameValidation.message],
//     },
//     username: {
//       type: String,
//       required: [true, "Username is required"],
//       unique: true,
//       minlength: [3, "Username must be at least 3 characters long"],
//       maxlength: [30, "Username cannot exceed 30 characters"],
//       match: [usernameValidation.value, usernameValidation.message],
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//     },
//     token: {
//       type: String,
//       default: null,
//     },
//     verificationCode: {
//       type: String,
//       default: null,
//     },
//     verify: {
//       type: Boolean,
//       default: false,
//       required: true,
//     },

//     bio: {
//       type: String,
//       default: "",
//       maxlength: [150, "Bio cannot exceed 150 characters"],
//     },
//     link: {
//       type: String,
//       default: "",
//     },
//     avatarUrl: {
//       type: String,
//       default: "",
//     },
//     followers: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         default: [],
//       },
//     ],
//     following: [
//       {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         default: [],
//       },
//     ],
//   },
//   {
//     versionKey: false,
//     timestamps: true,
//   },
// );

// const User = model<IUser>("User", userSchema);

// export default User;

import { Schema, model, Document } from "mongoose";
import {
  emailValidation,
  usernameValidation,
  fullnameValidation,
} from "../constants/users.constants";

export interface IUser extends Document {
  _id: string;
  email: string;
  fullname: string;
  username: string;
  password: string;

  refreshToken?: string; // 👈 ИЗМЕНЕНИЕ: было token

  verify: boolean;
  verificationCode?: string;

  bio?: string;
  link?: string;
  avatarUrl?: string;

  followers: string[];
  following: string[];
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      match: [emailValidation.value, emailValidation.message],
      required: [true, "Email is required"],
    },
    fullname: {
      type: String,
      required: [true, "Fullname is required"],
      minlength: [2, "Fullname must be at least 2 characters long"],
      maxlength: [50, "Fullname cannot exceed 50 characters"],
      match: [fullnameValidation.value, fullnameValidation.message],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [usernameValidation.value, usernameValidation.message],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // 👇 ИЗМЕНЕНИЕ: храним Refresh токен
    refreshToken: {
      type: String,
      default: "",
    },

    verificationCode: {
      type: String,
      default: null,
    },
    verify: {
      type: Boolean,
      default: false,
      required: true,
    },

    bio: {
      type: String,
      default: "",
      maxlength: [150, "Bio cannot exceed 150 characters"],
    },
    link: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const User = model<IUser>("User", userSchema);

export default User;
