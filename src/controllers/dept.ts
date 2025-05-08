import { Request, Response } from "express";
import { Dept, DeptTypes } from "../models/Dept";

const create = async (req: Request, res: Response) => {
  try {
    const { name, parentId, desc } = req.body as DeptTypes;
    const newDept = new Dept({ name, parentId, desc });
    await newDept.save();
    res.status(201).json({ message: "创建成功", dept: newDept });
  } catch (err: any) {
    if (err.name === "MongoServerError" && err.code === 11000) {
      res
        .status(400)
        .json({ error: "唯一键冲突，部门名称重复", message: err.message });
    } else {
      console.error(err);
      res.status(500).json({ error: "创建失败" });
    }
  }
};

const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dept = await Dept.findById(id);
    if (!dept) {
      res.status(404).json({ error: "部门不存在" });
    } else {
      res.status(200).json({ dept });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
};

const updateOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId, desc } = req.body as DeptTypes;
    const updatedDept = await Dept.findByIdAndUpdate(
      id,
      { name, parentId, desc },
      { new: true }
    );
    if (!updatedDept) {
      res.status(404).json({ error: "部门不存在" });
    } else {
      res.status(200).json({ message: "更新成功", dept: updatedDept });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "更新失败" });
  }
};

const deleteOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedDept = await Dept.findByIdAndDelete(id);
    if (!deletedDept) {
      res.status(404).json({ error: "部门不存在" });
    } else {
      res.status(200).json({ message: "删除成功", dept: deletedDept });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "删除失败" });
  }
};

interface GetAllQuery extends Partial<DeptTypes> {
  page?: string;
  limit?: string;
  fields?: string; //过滤字段 例如 "_id name" 则过滤_id和name字段
}
const getAll = async (req: Request, res: Response) => {
  try {
    const body = req.body as GetAllQuery;
    const page = parseInt(body.page as string) || 1; // 默认为第 1 页
    const limit = parseInt(body.limit as string) || 10; // 默认为每页 10 条
    const skip = (page - 1) * limit; //跳过页数

    const query: any = {
      name: { $regex: body.name || "", $options: "i" },
      desc: { $regex: body.desc || "", $options: "i" },
    };

    if (body.parentId) {
      query.parentId = body.parentId;
    }

    // 创建一个新的查询对象仅用于计数，避免 skip 和 limit 的影响
    const countQuery = Dept.find(query);
    const total = await countQuery.countDocuments();

    const resQuery = Dept.find(query)
      .skip(skip)
      .limit(limit)
      .select(body.fields || "");
    const depts = await resQuery;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: depts,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "查询失败" });
  }
};

export default { create, getOne, updateOne, deleteOne, getAll };
