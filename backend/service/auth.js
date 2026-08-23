import bcrypt from "bcryptjs"
import { CreateMember, CreateResume, CreateUser, EditMyProfileModel, GetMemberByUserAndPost, GetMyApplicationResultModel, GetMyProfileModel, GetPostByIDModel, GetPostModel, GetUserByEmail } from "../models/auth.js"
import AppError from '../utils/AppError.js'
import jwt from 'jsonwebtoken'
import { UploadToSupabase } from "../utils/UploadToSupabase.js";
import axios from "axios"
import { AuthWeakPasswordError } from "@supabase/supabase-js";

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
        { expiresIn : '15m' }
    )

    return {
        message : 'Login succeed',
        token : token,
        role : user.role
    }
}

export const GetPostService = async () => {
    const result = await GetPostModel()

    return {
        message : 'Get post succeed',
        data : result
    }
} 


export const ApplyResumeService = async (
    userId,
    postId,
    files,
) => {

    const member = await GetMemberByUserAndPost(
        userId,
        postId
    );

    if (member) {
        throw new AppError("You already applied", 409);
    }

        const post = await GetPostByIDModel(
        postId
    )

    if (!post) {
        throw new AppError("Post not found", 404)
    }

    const resume = files.resume?.[0];
    const transcript = files.transcript?.[0];


    if (!resume || !transcript) {
        throw new AppError(
            "Please upload resume and transcript",
            400
        );
    }


    const resumeUpload = await UploadToSupabase(
        resume.buffer,
        resume.mimetype,
        "resume",
        "resume",
        resume.originalname
    );

    console.log("show public url")
    console.log(resumeUpload.publicUrl)
    const transcriptUpload = await UploadToSupabase(
        transcript.buffer,
        transcript.mimetype,
        "transcript",
        "transcript",
        transcript.originalname
    );

    console.log(post.description)
    const aiResult = await axios.post(
        "https://duckling-hangup-resistant.ngrok-free.dev/analyze",
        {
            resume_url : resumeUpload.publicUrl,
            job_text : post.description,
            model_provider: 'openai',
            model_name : 'gpt-5.6-luna',
        }
    );


  // 1. Log ดู Response ทั้งหมดที่ FastAPI ส่งกลับมา (จะได้เห็นโครงสร้างแบบเต็มๆ)
    console.log("=== FULL AI RESULT ===");
    console.log(JSON.stringify(aiResult.data, null, 2));

    // 2. Log เช็คการสกัด Text (ดูว่าเป็น text_layer หรือ ocr_fallback)
    console.log("=== EXTRACTION INFO ===");
    console.log("Method:", aiResult.data.text_extraction_method);
    console.log("Warning:", aiResult.data.text_extraction_warning);

    const memberResult = await CreateMember(
        userId,
        postId
    );

    const memberId = memberResult.insertId;

    // 3. ปรับ analysis ให้แปลง Array/Object เป็น String ก่อน (ป้องกัน [object Object])
    const hardSkills = Array.isArray(aiResult.data.skills?.hard)
        ? aiResult.data.skills.hard.join(", ")
        : JSON.stringify(aiResult.data.skills?.hard || "");

    const analysis = `
        skills : ${hardSkills} 
        Storytelling_score : ${aiResult.data.storytelling_score}
        ai_reason : ${aiResult.data.ai_reason}
        overall_confidence : ${aiResult.data.overall_confidence}
    `.trim();

    // 4. Log ดูค่าที่จะเซฟลง Database จริงๆ
    console.log("=== ANALYSIS STRING TO SAVE ===");
    console.log(analysis);  

    
    await CreateResume(
        memberId,
        resumeUpload.publicUrl,
        transcriptUpload.publicUrl,
        aiResult.data.matching_score,
        `${aiResult.data.skills.hard}`,
        aiResult.data.storytelling_score,
        aiResult.data.ai_reason,
        aiResult.data.overall_confidence
    );

    return {
        message: "Apply resume succeed",
        score: aiResult.data.matching_score,
        analysis: analysis
    };
};



export const EditMyProfileService = async (id, data) => {
    const check = await EditMyProfileModel(id, data)
    if (!check.affectedRows === 0) {
        throw new AppError('User not found', 404)
    }

    return {
        message : 'Edit my profile succeed'
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

export const GetMyApplicationResultService = async (id) => {
    const data = await GetMyApplicationResultModel(id)

    if (!data) {
        throw new AppError('No application found for this user', 404)
    }

    return {
        message : 'Get my application',
        data : data
    }
}   
