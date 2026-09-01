import asyncHandler from "express-async-handler"
import { ApplyResumeService, GetMyApplicationResultService, GetPostService } from "../service/applicant.js"

export const GetPost = asyncHandler(async (req, res) => {
    const result = await GetPostService(req.query)
    res.status(200).json(result)
})

export const ApplyResume = asyncHandler(async (req, res) => {
    const result = await ApplyResumeService( req.user.id, req.params.postId, req.files )
    res.status(201).json(result)
})

export const GetMyApplicationResult = asyncHandler(async (req, res) => {
    const result = await GetMyApplicationResultService(req.user.id)
    res.status(200).json(result)
})