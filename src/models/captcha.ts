/*
  二维码的模型
*/

import mongoose from "mongoose";

export type CaptchaTypes = {
  code: string; // 验证码
  expireAt: Date; // 过期时间
};

export type CaptchaDocument = mongoose.Document & CaptchaTypes;

const captchaSchema = new mongoose.Schema({
  code: { type: String, required: true }, // 验证码
  expireAt: { type: Date, default: Date.now, index: { expires: "5m" } }, // 过期时间，5分钟后自动删除
});

export default mongoose.model<CaptchaDocument>("captchas", captchaSchema);
