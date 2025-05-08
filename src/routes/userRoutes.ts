import express from "express";
import { UserDocument, User } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById((req as any).userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "用户未找到" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "获取用户信息失败" });
  }
});

// 获取用户列表（需要鉴权）
router.get("/list", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

// 中间件：验证 JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "未提供令牌" });

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "无效的令牌" });
    req.userId = user.userId;
    next();
  });
}

export default router;
