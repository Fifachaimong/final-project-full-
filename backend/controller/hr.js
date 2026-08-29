import asyncHandler from "express-async-handler";
import { CreatePostService, DeleteMemberInPostService, DeletePostService, EditPostService, GetMemberResumeResultService, GetMemberService, GetProfileByMemberService, UpdateCandidateStatusService } from "../service/hr.js";

export const CreatePost = asyncHandler(async (req, res) => {
    const data = req.body
    const result = await CreatePostService(req.user.id, data, req.file)
    res.status(201).json(result)
})

export const EditPost = asyncHandler(async (req, res) => {
    const data = req.body
    const result = await EditPostService(data, req.user.id, req.params.id, req.file, req.user.role)
    res.status(200).json(result)
})

export const DeletePost = asyncHandler(async (req, res) => {
    const result = await DeletePostService(req.user.id, req.params.id, req.user.role)
    res.status(200).json(result)
})

export const GetMember = asyncHandler(async (req, res) => {
    const result = await GetMemberService(req.user.id, req.params.post_id)
    res.status(200).json(result)
})

export const GetProfileByMember = asyncHandler(async (req, res) => {
    const result = await GetProfileByMemberService(req.params.id, req.user.id)
    res.status(200).json(result)
})
 
export const GetMemberResumeResult = asyncHandler(async (req, res) => {
    const result = await GetMemberResumeResultService(req.params.id, req.user.id, req.params.post_id)
    res.status(200).json(result)
})

export const UpdateCandidateStatus = asyncHandler(async (req, res) => {
    const result = await UpdateCandidateStatusService(req.body.status, req.params.id, req.user.id, req.params.post_id)
    res.status(200).json(result)
})

export const DeleteMemberInPost = asyncHandler(async (req, res) => {
    const result = await DeleteMemberInPostService(req.params.id, req.user.id, req.params.post_id)
    res.status(200).json(result)
})