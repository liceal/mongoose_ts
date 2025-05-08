import express from "express";
import DeptController from "../controllers/dept";
import UserController from "../controllers/user";

const router = express.Router();

// 创建部门
router.post("/create", UserController.protect, DeptController.create);

// 查询部门
router.get("/get/:id", UserController.protect, DeptController.getOne);

// 更新部门
router.put("/update/:id", UserController.protect, DeptController.updateOne);

// 删除部门
router.delete("/delete/:id", UserController.protect, DeptController.deleteOne);

// 查询所有部门
router.post("/list", UserController.protect, DeptController.getAll);

export default router;
