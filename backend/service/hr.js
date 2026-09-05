import { CreatePostModel, DeleteMemberInPostModel, DeletePostModel, EditPostModel, GetMemberFileUrlsByOwnerAndPostID, GetMemberModel, GetMemberResumeResultModel, GetMemberTotalCount, GetMyPostModel, GetMyPostTotalCount, GetPostFileUrlsByOwnerAndPostID, GetProfileByMemberModel, UpdateCandidateStatusModel } from "../models/hr.js";
import { GetPostByIDModel } from "../models/auth.js";
import AppError from "../utils/AppError.js";
import { UploadToCloudinary } from "../utils/UploadToCloudinary.js";
import { DeleteManyFromCloudinary, ExtractPublicId } from "../utils/DeleteFromCloudinary.js";

export const CreatePostService = async (id, data, file) => {
    let icon = null

    if (file) {
        const upload = await UploadToCloudinary(
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
    let oldIconUrl = null

    if (file) {
        const currentPost = await GetPostByIDModel(post_id)
        oldIconUrl = currentPost?.icon ?? null

        const upload = await UploadToCloudinary(
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

    if (oldIconUrl) {
        const oldPublicId = ExtractPublicId(oldIconUrl)

        if (oldPublicId) {
            await DeleteManyFromCloudinary([oldPublicId], "image")
        }
    }

    return {
        message : 'Edit posts succeed'
    }
}

export const DeletePostService = async (owner_id, post_id, role) => {
    const data = await GetPostFileUrlsByOwnerAndPostID(owner_id, post_id, role)

    const logoCompanyPaths = []
    const resumePaths = []
    const transcriptPaths = []

    for (const item of data) {

        if (item.logo_company) {
            logoCompanyPaths.push(ExtractPublicId(item.logo_company))
        }

        if (item.resume) {
            resumePaths.push(ExtractPublicId(item.resume))
        }

        if (item.transcript) {
            transcriptPaths.push(ExtractPublicId(item.transcript))
        }

    }

    await DeleteManyFromCloudinary(logoCompanyPaths, "image")
    await DeleteManyFromCloudinary(resumePaths, "raw")
    await DeleteManyFromCloudinary(transcriptPaths, "raw")

    const check = await DeletePostModel(owner_id, post_id, role)
    if (check.affectedRows === 0) {
        throw new AppError('Post not found', 404)
    }

    return {
        message : 'Delete post succeed'
    }
}

export const GetMyPostService = async (owner_id, query = {}) => {
    let { page, limit, search = null } = query

    page = Number(page)
    limit = Number(limit)

    page = page > 0 ? page : 1
    limit = limit < 11 && limit > 0 ? limit : 10
    const setoff = (page - 1) * limit

    const data = await GetMyPostModel(owner_id, setoff, limit, search)

    const total = await GetMyPostTotalCount(owner_id, search)
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

    const allowedStatuses = ['pending', 'approved', 'rejected']

    const filterArray = Array.isArray(filter)
        ? filter
        : filter
        ? [filter]
        : []

    filter = filterArray.filter((f) => allowedStatuses.includes(f))

    const data = await GetMemberModel(owner_id, post_id, setoff, limit, filter)

    const total = await GetMemberTotalCount(owner_id, post_id, filter)
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
    const data = await GetMemberFileUrlsByOwnerAndPostID(member_id, owner_id, post_id)

    const resumePaths = []
    const transcriptPaths = []

    for (const item of data) {

        if (item.resume) {
            resumePaths.push(ExtractPublicId(item.resume))
        }

        if (item.transcript) {
            transcriptPaths.push(ExtractPublicId(item.transcript))
        }

    }

    await DeleteManyFromCloudinary(resumePaths, "raw")
    await DeleteManyFromCloudinary(transcriptPaths, "raw")

    const result = await DeleteMemberInPostModel(member_id, owner_id, post_id)

    if (result.affectedRows === 0) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Delete member succeed'
    }
}