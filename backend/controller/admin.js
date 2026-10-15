import asyncHandler from "express-async-handler"
import { ApproveUserService, CreateUserByAdminService, DeleteUserService, EditUserService, GetUnapprovedUsersService, GetUserByAdminService } from "../service/admin.js"


export const GetUserByAdmin = asyncHandler(async (req, res) => {
    const result = await GetUserByAdminService(req.query)
    res.status(200).json(result)
})

export const CreateUserByAdmin = asyncHandler(async (req, res) => {
    const data = req.body
    const result = await CreateUserByAdminService(data)
    res.status(201).json(result)
})

export const DeleteUser = asyncHandler(async (req, res) => {
    const result = await DeleteUserService(req.params.id)
    res.status(200).json(result)
})

export const ApproveUser = asyncHandler(async (req, res) => {
    const result = await ApproveUserService(req.params.id, req.body.approval)
    res.status(200).json(result)
})

export const EditUser = asyncHandler(async (req, res) => {
    const result = await EditUserService(req.params.id, req.body)
    res.status(200).json(result)
})

export const GetUnapprovedUsers = asyncHandler(async (req, res) => {
    const result = await GetUnapprovedUsersService(req.query)
    res.status(200).json(result)
})