import express from "express";
import { UserDocument, User } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import UserController from "../controllers/user";

dotenv.config();

const router = express.Router();

// 注册接口
router.post("/register", async (req: { body: UserDocument }, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "用户已存在" });
    }

    // 创建新用户
    const newUser = new User({ username, email, password: password });
    await newUser.save();

    // 生成token
    const token = newUser.generateAuthToken();

    res.status(201).json({ message: "用户注册成功", token });
  } catch (error: any) {
    console.error("注册失败", error);
    res.status(500).json({ error: "注册失败", message: error.message });
  }
});

// 登录接口
router.post("/login", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 检查用户是否存在
    let user;
    if (username) {
      user = await User.findOne({ username }).select("+password");
    } else if (email) {
      user = await User.findOne({ email }).select("+password");
    }
    if (!user) {
      return res.status(400).json({ error: "用户不存在" });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "密码错误" });
    }

    // 生成 JWT token
    const token = user.generateAuthToken();

    res.json({ message: "登录成功", token });
  } catch (error) {
    res.status(500).json({ error: "登录失败" });
  }
});

// 获取用户信息（需要鉴权）
router.get("/me", UserController.protect, async (req, res) => {
  try {
    const user = req.user as UserDocument;
    if (!user) {
      return res.status(404).json({ error: "用户未找到" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "获取用户信息失败" });
  }
});

// 获取用户列表（需要鉴权）
router.get("/list", UserController.protect, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

export default router;
