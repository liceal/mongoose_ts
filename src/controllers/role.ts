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
    const body = req.body;
    const page = body.page || 1;
    const limit = body.limit || 10;
    const skip = (page - 1) * limit;
    const data = await Role.aggregate([
      // 先条件过滤
      {
        $match: { name: { $regex: body.name || "", $options: "i" } },
      },
      {
        $facet: {
          // data数据获取
          data: [
            // 再分页
            { $limit: limit },
            { $skip: skip },
            {
              // 分页后的数据进行表关联
              $lookup: {
                from: "depts", //我命名是Dept 会自动被转成小些加复数 就是depts，可以看数据库里的表
                localField: "departments",
                foreignField: "_id",
                as: "deptDetails",
              },
            },
            {
              // 对每一个数据进行结构更改 只要这四个字段
              $project: {
                _id: 1,
                name: 1,
                departments: 1,
                deptDetails: 1,
              },
            },
          ],
          // 总数获取
          total: [{ $count: "count" }],
        },
      },
      {
        // 最后返回的数据更改结构
        // $arrayElemAt 获取数组数据中的第一个元素
        // $literal 字面量 固定值
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$total.count", 0] },
          page: { $literal: Math.floor(skip / limit) + 1 },
          pageSize: { $literal: limit }, // 每页大小
        },
      },
    ]);

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
