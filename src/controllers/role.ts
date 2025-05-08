import { Request, Response } from "express";
import { Role, RoleDocument } from "../models/Role";
import { my_toList } from "../utils";

// 创建角色
const create = async (req: Request, res: Response) => {
  try {
    const { name, description, departments } = req.body;
    const newRole: RoleDocument = new Role({
      name,
      description,
      departments,
    });
    const savedRole = await newRole.save();
    res.status(201).json(savedRole);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// 查询单个角色
const getOne = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id).populate("departments");
    if (!role) {
      return res.status(404).json({ error: "角色未找到" });
    }
    res.status(200).json(role);
  } catch (error: any) {
    console.error(error);
    if (error.kind === "ObjectId") {
      res.status(404).json({ error: "角色未找到_" });
    }
    res.status(400).json({ error: error.message });
  }
};

// 查询所有角色
const list = async (req: Request, res: Response) => {
  try {
    // const roles = await Role.find().populate("departments");

    // const data = await my_toList(Role, req, (model) => {
    //   model.populate("departments");
    // });

    // const data = await my_toList(Role, req, (model) => {
    //   return model.populate("departments", "_id name");
    // });
    // const data = await my_toList(
    //   req,
    // ).find().populate("departments", "_id name")

    const data = await my_toList(req, Role.find(), (model) => {
      return model.populate("departments");
    });

    console.log(data);

    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// 更新角色
const updateOne = async (req: Request, res: Response) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("departments");
    if (!updatedRole) {
      return res.status(404).json({ error: "角色未找到" });
    }
    res.status(200).json(updatedRole);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// 删除角色
const deleteOne = async (req: Request, res: Response) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ error: "角色未找到" });
    }
    res.status(200).json({ message: "角色删除成功" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// 导出控制器方法
export default {
  create,
  getOne,
  list,
  updateOne,
  deleteOne,
};
