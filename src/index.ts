import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import deptRoutes from "./routes/deptRoutes";
import roleRoutes from "./routes/roleRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7100;

// 连接数据库
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("数据库连接成功");
  })
  .catch((err) => {
    console.error("数据库连接失败", err);
  });

// 中间件
app.use(express.json());

// 路由
app.use("/api/users", userRoutes);
app.use("/api/dept", deptRoutes);
app.use("/api/role", roleRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
