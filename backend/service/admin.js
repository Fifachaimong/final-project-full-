import { CreateUserByAdminModel, DeleteUserByID, EditUserByIDModel, GetUserByAdminModel, GetUserFileUrlsByUserID } from "../models/admin.js"
import { GetTotalPage, GetUserByEmail } from "../models/auth.js"
import AppError from "../utils/AppError.js"
import supabase from "../config/supabase.js"
import bcrypt from "bcryptjs"

export const GetUserByAdminService = async (query = {}) => {
    let { page, limit, filter } = query

    page = Number(page)
    limit = Number(limit)

    page = page > 0 ? page : 1
    limit = limit < 11 && limit > 0 ? limit : 10
    const setoff = (page - 1) * limit 

    filter = ['applicant', 'hr', 'admin'].includes.filter ? filter : null

    const data = await GetUserByAdminModel(setoff, limit, filter)

    const total = await GetTotalPage('users')
    const totalPages = Math.ceil(total.total/limit)

    let nextPage = page < totalPages ? page + 1 : null
    let prevPage = page > 1 ? page - 1 : null

    return {
        message : 'Get User succeed',
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

export const CreateUserByAdminService = async (data) => {
    const { firstname, lastname, email, password, role } = data
    const user = await GetUserByEmail(email)
    if (user) {
        throw new AppError('This email is already in use', 409)
    }

    const hashpassword = await bcrypt.hash(password, 10)
    const NewData = {
        firstname,
        lastname,
        email,
        password : hashpassword,
        role
    }

    await CreateUserByAdminModel(NewData)

    return {
        message : 'Create user succeed'
    }
    
}

export const DeleteUserService = async (id) => {
    const data = await GetUserFileUrlsByUserID(id)

    const profilePaths = []
    const logoCompanyPaths = []
    const resumePaths = []
    const transcriptPaths = []

    const getUrl = (url) => {
        return url.split('/').pop()
    }

    for (const item of data) {
        if (item.profile) {
            profilePaths.push(getUrl(item.profile))
        }

        if (item.logo_company) {
            logoCompanyPaths.push(getUrl(item.logo_company))
        }

        if (item.resume) {
            resumePaths.push(getUrl(item.resume))
        }

        if (item.transcript) {
            transcriptPaths.push(getUrl(item.transcript))
        }

    }

    if (profilePaths.length > 0) {
        await supabase.storage.from("profile").remove(profilePaths)
    }

    if (logoCompanyPaths.length > 0) {
        await supabase.storage.from("logo_company").remove(logoCompanyPaths)
    }

    if (resumePaths.length > 0) {
        await supabase.storage.from("resume").remove(resumePaths)
    }

    if (transcriptPaths.length > 0) {
        await supabase.storage.from("transcript").remove(transcriptPaths)
    }

    const result = await DeleteUserByID(id)
    if (result.affectedRows === 0) {
        throw new AppError('User not found', 404)
    }

    return {
        message : "Delete user succeed"
    }

}

export const EditUserService = async (id, data) => {
    const { firstname, lastname, phone, role } = data
    let { password } = data
    if (password) {
        password = await bcrypt.hash(password, 10)
    }

    const NewData = {
        id,
        firstname,
        lastname,
        password,
        phone,
        role
    }

    const result = await EditUserByIDModel(NewData)
    if (result.affectedRows === 0) {
        throw new AppError('User not found', 404)
    }

    return {
        message : "Edit user succeed"
    }

}