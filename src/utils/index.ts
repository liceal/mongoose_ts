import { Model, Query, QueryWithHelpers } from "mongoose";
import { Request } from "express";

export const my_toList = async <T>(
  req: Request,
  findQuery: Query<Array<T>, T, {}, T>,
  cb: (model: Query<Array<T>, T, {}, T>) => Query<Array<T>, T, {}, T>
) => {
  const page = req.body.page || 1;
  const limit = req.body.limit || 10;
  const fields = req.body.fields || "";
  const skip = (page - 1) * limit;

  // 创建一个新的查询对象，仅应用过滤条件，不应用分页和字段选择
  const total = await findQuery.clone().countDocuments();
  const paginationRes = findQuery.skip(skip).limit(limit).select(fields);
  const results = await cb(paginationRes);

  // 对过滤后的查询条件进行统计

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    results,
  };
};

// interface listQuery {
//   page?: number;
//   limit?: number;
//   fields?: string;
// }
// export const append_pagination = async <T>(
//   model: Model<T>,
//   req: Request,
//   cb: (model: Query<Array<T>, T, {}, T>, data) => void
// ) => {
//   const body = req.body as listQuery;
//   const page = body.page || 1;
//   const limit = body.limit || 10;
//   const skip = (page - 1) * limit; //跳过页数
//   const total = await model.countDocuments();

//   cb(model);
// };
