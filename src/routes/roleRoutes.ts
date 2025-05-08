import express from "express";
import RoleController from "../controllers/role";
import UserController from "../controllers/user";

const router = express.Router();

// 创建角色
router.post("/create", UserController.protect, RoleController.create);

// 查询角色
router.get("/get/:id", UserController.protect, RoleController.getOne);

// 查询所有角色
router.post("/list", UserController.protect, RoleController.list);

// 更新角色
router.put("/update/:id", UserController.protect, RoleController.updateOne);

// 删除角色
router.delete("/delete/:id", UserController.protect, RoleController.deleteOne);

export default router;
