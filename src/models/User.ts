import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  password: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  generateAuthToken: () => string;
};

const userSchema = new mongoose.Schema<UserDocument>({
  username: {
    type: String,
    unique: true,
    required: [true, "用户名不能为空"],
    minlength: [4, "最小2位用户名"],
    maxlength: [10, "最大10位用户名"],
  },
  email: {
    type: String,
    unique: false,
    required: [true, "邮箱不能为空"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "请输入有效的邮箱地址",
    ],
  },
  password: {
    type: String,
    required: [true, "密码不能为空"],
    minlength: [6, "最小6位密码"],
  },
});

// 保存前进行密码加密
userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
  next();
});

// 比较密码
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidatePassword, user.password);
};

export interface jwtMsg {
  userId: string;
}

// 生成JWT
userSchema.methods.generateAuthToken = function () {
  const user = this as UserDocument;
  const token = jwt.sign(
    { userId: user._id } as jwtMsg,
    process.env.JWT_SECRET!,
    {
      expiresIn: "8h",
    }
  );
  return token;
};

export const User = mongoose.model<UserDocument>("users", userSchema);
