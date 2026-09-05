import bcrypt from "bcryptjs"
import { CreateUser, EditMyProfileModel, GetMyProfileModel, GetPostByIDModel, GetUserByEmail } from "../models/auth.js"
import AppError from '../utils/AppError.js'
import jwt from 'jsonwebtoken'
import { UploadToCloudinary } from "../utils/UploadToCloudinary.js";
import { DeleteManyFromCloudinary, ExtractPublicId } from "../utils/DeleteFromCloudinary.js";

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
        { expiresIn : '1h' }
    )

    return {
        message : 'Login succeed',
        token : token,
        role : user.role
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
        const oldPublicId = ExtractPublicId(oldIconUrl)

        if (oldPublicId) {
            await DeleteManyFromCloudinary([oldPublicId], "image")
        }
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