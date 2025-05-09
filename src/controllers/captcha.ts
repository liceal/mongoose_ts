import { Request, Response } from "express";
import svgCaptcha from "svg-captcha";
import Captcha from "@/models/captcha";
import { ObjectId } from "mongoose";

// 获取验证码
const getCaptcha = async (req: Request, res: Response) => {
  try {
    const captcha = svgCaptcha.create();
    // 将验证码文本存入数据库
    const newCaptcha = new Captcha({
      code: captcha.text,
      expireAt: new Date(Date.now() + 5 * 60 * 1000), //5分装
    });
    await newCaptcha.save();

    // 设置响应头
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(captcha.data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "获取验证码失败" });
  }
};

// 验证验证码
interface verifyCaptcha {
  id: ObjectId;
  code: string;
}
const verifyCaptcha = async (req: Request, res: Response) => {
  try {
    const { id, code } = req.body as verifyCaptcha;
    const captcha = await Captcha.findById(id);
    if (!captcha) {
      return res.status(404).json({ error: "验证码不存在" });
    }
    let nowDate = new Date();
    if (captcha.expireAt < nowDate) {
      return res.status(200).json({ error: "验证码已过期" });
    }
    if (captcha.code !== code) {
      return res.status(200).json({ error: "验证码错误" });
    }

    await Captcha.findByIdAndDelete(id);
    res.status(200).json({
      message: `验证成功，验证码：${code},验证完成，验证码将被删除`,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "验证码验证失败" });
  }
};

export default {
  getCaptcha,
  verifyCaptcha,
};
