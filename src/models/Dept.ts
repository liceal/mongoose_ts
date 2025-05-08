import mongoose from "mongoose";

export type DeptTypes = {
  name: string; //部门名称
  parentId: string | null; //上级部门id
  desc: string; //部门描述
};

export type DeptDocument = mongoose.Document & DeptTypes;

const deptSchema = new mongoose.Schema<DeptDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    parentId: {
      type: String,
      default: null,
    },
    desc: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const Dept = mongoose.model<DeptDocument>("Dept", deptSchema);
