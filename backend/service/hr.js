import { GetUserByID } from "../models/auth.js";
import { CreatePostModel, DeletePostModel, EditPostModel, GetMemberModel, GetMemberResumeResultModel, GetProfileByMemberModel, UpdateCandidateStatusModel } from "../models/hr.js";
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

export const DeletePostService = async (id, post_id) => {
    const check = await DeletePostModel(id, post_id)
    if (check.affectedRows === 0) {
        throw new AppError('Post not found', 404)
    }

    return {
        message : 'Delete post succeed'
    }
}

export const GetMemberService = async (owner_id) => {
    const data = await GetMemberModel(owner_id)
    
    return {
        message : 'Get my member succeed',
        data : data
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

export const GetMemberResumeResultService = async (member_id, owner_id) => {
    const data = await GetMemberResumeResultModel(member_id, owner_id)
    
    if (!data) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Get analysis of members resumes',
        data : data
    }
}

export const UpdateCandidateStatusService = async (member_status, member_id, owner_id) => {
    const data = await UpdateCandidateStatusModel(member_status, member_id, owner_id)

    if (data.affectedRows === 0) {
        throw new AppError('Member not found', 404)
    }

    return {
        message : 'Update applicant status'
    }
}