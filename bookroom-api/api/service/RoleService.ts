import RoleModel from "../models/RoleModel";
import { Identifier, Op } from "sequelize";
import UserRolesService from "./UserRoleService";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import { StatusEnum } from "@/constants/DataMap";
import { getOrderArray } from "@/utils/query";

class RoleService {

    // 获取全部已启用角色列表(admin角色排除在外)
    static async queryActivedRecords() {
        const result = await RoleModel.findAll({
            where: {
                status: StatusEnum.ENABLE,
                code: {
                    [Op.ne]: USER_ROLE_ENUM.ADMIN
                },
            },
        });
        return result;
    }

    // 获取列表(admin角色排除在外)
    static async queryRecords(params: any) {
        if (!params) {
            return false;
        }
        let { current, pageSize, sorter } = params;
        const { name, code, status, startDate, endDate } = params;
        current = current ? Number.parseInt(current) : 1;
        pageSize = pageSize ? Number.parseInt(pageSize) : 10;
        const where: any = {
            code: {
                [Op.ne]: USER_ROLE_ENUM.ADMIN
            },
        };
        if (name) {
            where.name = {
                [Op.like]: `%${name}%`,
            };
        }
        if (name) {
            where.code = {
                [Op.like]: `%${code}%`,
            };
        }
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            if (startDate && !endDate) {
                where.createdAt = {
                    [Op.gte]: startDate,
                };
            }
            if (!startDate && endDate) {
                where.createdAt = {
                    [Op.lte]: endDate,
                };
            }
            if (startDate && endDate) {
                where.createdAt = {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                };
            }
        }

        const result = await RoleModel.findAndCountAll({
            where: where,
            attributes: { exclude: [] }, // 过滤字段
            offset: (current - 1) * pageSize,
            limit: pageSize,
            order: getOrderArray(sorter)
        }).then((data) => {
            return Promise.resolve({
                current: current,
                pageSize: pageSize,
                total: data?.count,
                list: data?.rows
            });
        });
        return result;
    }

    // 查询单条数据-ById
    static async findRecordById(id: Identifier | undefined) {
        if (!id) {
            return false;
        }
        const result = await RoleModel.findByPk(id);
        return result;
    }

    // 查询单条数据-ByName
    static async findRecordByName(name: string | string[]) {
        if (!name) {
            return false;
        }
        const result = await RoleModel.findOne({
            where: {
                name: name,
            },
        });
        return result;
    }

    // 查询单条数据-ByName
    static async findRecordByCode(code: string | string[]) {
        if (!code) {
            return null;
        }
        const result = await RoleModel.findOne({
            where: {
                code: code,
            },
        });
        return result;
    }

    // 添加数据
    static async addRecord(data: any) {
        if (!data) {
            return false;
        }
        // 判定数据唯一性
        const unique = await RoleModel.judgeUnique(data);
        if (!unique) {
            throw new Error("角色已存在");
        }
        try {
            const result = await RoleModel.create({
                ...data,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
            return result;
        } catch (e) {
            const error: any = e;
            throw error;
        }
    }

    // 更新数据
    static async updateRecord(id: any, data: any) {
        if (!id || !data) {
            throw new Error("参数错误");
        }
        try {
            // 判定数据唯一性
            const unique = await RoleModel.judgeUnique(data, id);
            if (!unique) {
                throw new Error("角色已存在");
            }
            return await RoleModel.update(
                {
                    ...data,
                    updatedAt: new Date().getTime(),
                },
                {
                    where: {
                        id: id,
                    },
                }
            );
        } catch (e) {
            const error: any = e;
            throw error;
        }
    }

    // 删除数据
    static async deleteRecord(id: any) {
        if (!id) {
            return false;
        }
        try {
            const userRole = await UserRolesService.findRecordByRoleId(id);
            // 如果该角色已经关联于用户，则不允许删除
            if (userRole) {
                throw new Error("该角色已经关联于用户，不允许删除");
            }
            return await RoleModel.destroy({
                where: {
                    id: id,
                },
            });
        } catch (e) {
            const error: any = e;
            throw error;
        }
    }
}

export default RoleService;
