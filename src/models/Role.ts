import mongoose from "mongoose";
import { DeptDocument } from "./Dept";

// 定义角色类型
interface RoleTypes {
  name: string; // 角色名称
  description: string; // 角色描述
  departments: DeptDocument["_id"][]; // 关联部门 ID 数组
}

export type RoleDocument = mongoose.Document & RoleTypes;

const roleSchema = new mongoose.Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dept",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<RoleDocument>("Role", roleSchema);
