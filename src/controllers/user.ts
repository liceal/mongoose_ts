import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { jwtMsg, User } from "../models/User";
import NodeCache from "node-cache";
import { MongooseError } from "mongoose";

const userCache = new NodeCache({ stdTTL: 3600 }); // 缓存1小时

const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 检查token是否存在并且验证token的有效性
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "未提供token，请先登录" });
    }
    // 验证token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload & jwtMsg;

    console.log(decoded);

    console.log("jwt包含的信息", decoded.userId);
    // 其中包含userId 使用userId查询数据库，获取用户信息，将用户信息挂载到req上，方便后续使用
    if (decoded.userId) {
      const cachedUser = userCache.get(decoded.userId);
      if (cachedUser) {
        console.log("缓存获取user信息");
        req.user = cachedUser as any; // 将缓存的用户信息挂载到req上
        next(); // 继续执行下一个中间件或路由处理程序
      } else {
        User.findById(decoded.userId).then((user) => {
          if (!user) {
            return res.status(401).json({ message: "用户不存在" });
          }
          userCache.set(decoded.userId, user); // 将用户信息存入缓存
          req.user = user; // 将用户信息挂载到req上，方便后续使用
          next(); // 继续执行下一个中间件或路由处理程序
        });
      }
    }
  } catch (err: any) {
    console.log(err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "token已过期，请重新登录" });
    }
    return res.status(401).json({ message: "token验证失败" });
  }
};

export default { protect };
