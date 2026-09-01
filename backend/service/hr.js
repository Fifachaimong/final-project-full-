import { GetUserByID } from "../models/auth.js";
import { CreatePostModel, DeleteMemberInPostModel, DeletePostModel, EditPostModel, GetMemberModel, GetMemberResumeResultModel, GetMemberTotalCount, GetPostByHRModel, GetPostTotalCountByHR, GetProfileByMemberModel, UpdateCandidateStatusModel } from "../models/hr.js";
import AppError from "../utils/AppError.js";
import { UploadToSupabase } from "../utils/UploadToSupabase.js";

export const CreatePostService = async (id, data, file) => {
    const check = await GetUserByID(id)

    if (check.length === 0) {
        throw new AppError('User not found', 404)
    }

    let icon = null

    if (file) {
        const upload = await UploadToSupabase(
            file.buffer,
            file.mimetype,
            "logo_company",
            file.originalname
        )

        icon = upload.publicUrl
    }

    await CreatePostModel(id, data, icon)

    return {
        message: 'Create post succeed'
    }
}

export const EditPostService = async (data, owner_id, post_id, file, role) => {
    let icon = null

    if (file) {
        const upload = await UploadToSupabase(
            file.buffer,
            file.mimetype,
            "logo_company",
            file.originalname
        )

        icon = upload.publicUrl
    }

    const check = await EditPostModel(data, owner_id, post_id, icon, role)
    
    if (check.affectedRows === 0) {
        throw new AppError('Post not found', 404)
    }

    return {
        message : 'Edit posts succeed'
    }
}

export const DeletePostService = async (id, post_id, role) => {
    const check = await DeletePostModel(id, post_id, role)
    if (check.affectedRows === 0) {
        throw new AppError('Post not found', 404)
    }

    return {
        message : 'Delete post succeed'
    }
}

export const GetPostByHRService = async (owner_id, query = {}) => {
    let { page, limit } = query

    page = Number(page)
    limit = Number(limit)

    page = page > 0 ? page : 1
    limit = limit < 11 && limit > 0 ? limit : 10
    const setoff = (page - 1) * limit

    const data = await GetPostByHRModel(owner_id, setoff, limit)

    const total = await GetPostTotalCountByHR(owner_id)
    const totalPages = Math.ceil(total.total / limit)
    
    let nextPage = page < totalPages ? page + 1 : null
    let prevPage = page > 1 ? page - 1 : null

    return {
        message : 'Get posts succeed',
        data : data,
        meta : {
            total : total.total,
            page,
            limit,
            hasnextPage : page < totalPages,
            hasPrevPage : page > 1,
            nextPage,
            prevPage
        }
    }
}

export const GetMemberService = async (owner_id, post_id, query = {}) => {
    let { page, limit, filter } = query

    page = Number(page)
    limit = Number(limit)

    page = page > 0 ? page : 1
    limit = limit < 11 && limit > 0 ? limit : 10
    const setoff = (page - 1) * limit

    filter = ['pending', 'approved', 'rejected'].includes.filter ? filter : null

    const data = await GetMemberModel(owner_id, post_id, setoff, limit, filter)

    const total = await GetMemberTotalCount(owner_id, post_id)
    const totalPages = Math.ceil(total.total / limit)
    
    let nextPage = page < totalPages ? page + 1 : null
    let prevPage = page > 1 ? page - 1 : null

    return {
        message : 'Get my member succeed',
        data : data,
        meta : {
            total : total.total,
            page,
            limit,
            hasnextPage : page < totalPages,
            hasPrevPage : page > 1,
            nextPage,
            prevPage
        }
    }
}

export const GetProfileByMemberService = async (member_id, owner_id) => {
    const data = await GetProfileByMemberModel(member_id, owner_id)
    if (!data) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Get profile member succeed',
        data : data
    }
}

export const GetMemberResumeResultService = async (member_id, owner_id, post_id) => {
    const data = await GetMemberResumeResultModel(member_id, owner_id, post_id)
    
    if (!data) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Get analysis of members resumes succeed',
        data : data
    }
}

export const UpdateCandidateStatusService = async (member_status, member_id, owner_id, post_id) => {
    const data = await UpdateCandidateStatusModel(member_status, member_id, owner_id, post_id)

    if (data.affectedRows === 0) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Update applicant status succeed'
    }
}

export const DeleteMemberInPostService = async (member_id, owner_id, post_id) => {
    const data = await DeleteMemberInPostModel(member_id, owner_id, post_id)

    if (data.affectedRows === 0) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Delete member succeed'
    }
}