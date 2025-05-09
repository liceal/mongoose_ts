import express from "express";
import CommonController from "@/controllers/captcha";

const router = express.Router();

// 提供二维码的接口
router.get("/captcha", CommonController.getCaptcha);

// 验证验证码的接口
router.post("/captcha/verify", CommonController.verifyCaptcha);

export default router;
