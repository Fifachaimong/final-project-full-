import bcrypt from "bcryptjs"
import { CreateUser, EditMyProfileModel, GetMyProfileModel, GetPasswordHashByID, GetPostByIDModel, GetUserByEmail, UpdatePasswordByID } from "../models/auth.js"
import AppError from '../utils/AppError.js'
import jwt from 'jsonwebtoken'
import { UploadToCloudinary } from "../utils/UploadToCloudinary.js";
import { DeleteByUrls } from "../utils/DeleteFromCloudinary.js";

export const RegisterService = async (data) => {
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

    await CreateUser(NewData)
    return {
        message : 'Register succeed'
    }
}

export const LoginService = async (data) => {
    const { email, password } = data
    const user = await GetUserByEmail(email)
    if (!user) {
        throw new AppError('Incorrect email or password.', 401)
    }

    const check = await bcrypt.compare(password, user.password)
    if (!check) {
        throw new AppError('Incorrect email or password.', 401)
    }

    const token = jwt.sign(
        {
            id : user.id,
            role : user.role
        },
        process.env.JWT_TOKEN,
        { expiresIn : '1d' }
    )

    return {
        message : 'Login succeed',
        token : token,
        role : user.role
    }
}

export const ChangePasswordService = async (id, data) => {
    const { current_password, new_password } = data

    const currentHash = await GetPasswordHashByID(id)

    if (!currentHash) {
        throw new AppError('User not found', 404)
    }

    // ใช้ 400 ไม่ใช่ 401 เพราะ 401 ฝั่งหน้าบ้านถือว่า "เซสชันหมดอายุ"
    const isCurrentCorrect = await bcrypt.compare(current_password, currentHash)
    if (!isCurrentCorrect) {
        throw new AppError('รหัสผ่านปัจจุบันไม่ถูกต้อง', 400, 'current_password')
    }

    const isSamePassword = await bcrypt.compare(new_password, currentHash)
    if (isSamePassword) {
        throw new AppError('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน', 400, 'new_password')
    }

    const hashedPassword = await bcrypt.hash(new_password, 10)
    await UpdatePasswordByID(id, hashedPassword)

    return {
        message : 'Change password succeed'
    }
}

export const GetPostByIDService = async (id) => {
    const result = await GetPostByIDModel(id)

    if (!result) {
        throw new AppError('Posts not found', 404)
    }

    return {
        message: 'Get post by id succeed',
        data: result
    }
}

export const EditMyProfileService = async (id, data, file) => {

    let icon = null
    let oldIconUrl = null

    if (file) {
        const currentProfile = await GetMyProfileModel(id)
        oldIconUrl = currentProfile?.icon ?? null

        const upload = await UploadToCloudinary(
            file.buffer,
            file.mimetype,
            "profile",
            file.originalname
        )

        icon = upload.publicUrl
    }

    const check = await EditMyProfileModel(id, data, icon)

    if (check.affectedRows === 0) {
        throw new AppError('User not found', 404)
    }

    if (oldIconUrl) {
        await DeleteByUrls([oldIconUrl])
    }

    const updatedProfile = await GetMyProfileModel(id)

    return {
        message : 'Edit my profile succeed',
        data : updatedProfile
    }
}

export const GetMyProfileService = async (id) => {
    const data = await GetMyProfileModel(id)

    if(!data) {
        throw new AppError('User not found', 404)
    }

    return {
        message : 'Get my profile succeed',
        data : data
    }
}