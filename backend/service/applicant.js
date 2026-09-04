import { CreateMember, CreateResume, GetMemberByUserAndPost, GetMyApplicationResultModel, GetDataPostById, GetPostModel } from "../models/applicant.js"
import { GetTotalPage } from "../models/auth.js";
import AppError from '../utils/AppError.js'
import { UploadToCloudinary } from "../utils/UploadToCloudinary.js";
import axios from "axios"

export const GetPostService = async (query = {}) => {
    let { page, limit, filter = null } = query
    const { search = null } = query

    page = Number(page)
    limit = Number(limit)

    page = page > 0 ? page : 1
    limit = limit < 11 && limit > 0 ? limit : 10
    const setoff = (page - 1) * limit 
    const filteCheck = ['open', 'closed']

    if (!filteCheck.includes(filter) && filter !== null) {
        filter = null
    }

    const result = await GetPostModel(setoff, limit, search, filter)

    const total = await GetTotalPage('posts')
    const totalPages = Math.ceil(total.total/limit)

    let nextPage = page < totalPages ? page + 1 : null
    let prevPage = page > 1 ? page - 1 : null

    return {
        message : 'Get post succeed',
        data : result,
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

        const post = await GetDataPostById(postId)

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


    const resumeUpload = await UploadToCloudinary(
        resume.buffer,
        resume.mimetype,
        "resume",
        resume.originalname
    );

    console.log("show public url")
    console.log(resumeUpload.publicUrl)
    const transcriptUpload = await UploadToCloudinary(
        transcript.buffer,
        transcript.mimetype,
        "transcript",
        transcript.originalname
    );

    console.log(post.description)
    const aiResult = await axios.post(
        "https://duckling-hangup-resistant.ngrok-free.dev/analyze",
        {
            resume_url : resumeUpload.publicUrl,
            job_text : post.description,
            model_provider: post.model_provider,
            faculty_match: post.faculty
        }
    );

    console.log("=== FULL AI RESULT ===");
    console.log(JSON.stringify(aiResult.data, null, 2));

    console.log("=== EXTRACTION INFO ===");
    console.log("Method:", aiResult.data.text_extraction_method);
    console.log("Warning:", aiResult.data.text_extraction_warning);

    const memberResult = await CreateMember(
        userId,
        postId
    );

    const memberId = memberResult.insertId;

    const hardSkills = Array.isArray(aiResult.data.skills?.hard)
        ? aiResult.data.skills.hard.join(", ")
        : JSON.stringify(aiResult.data.skills?.hard || "");

    const analysis = `
        skills : ${hardSkills} 
        Storytelling_score : ${aiResult.data.storytelling_score}
        ai_reason : ${aiResult.data.ai_reason}
        overall_confidence : ${aiResult.data.overall_confidence}
    `.trim();

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
        aiResult.data.overall_confidence,
        aiResult.data.specific_strengths,
        aiResult.data.faculty_match
    );

    return {
        message: "Apply resume succeed",
        score: aiResult.data.matching_score,
        analysis: analysis
    };
};

export const GetMyApplicationResultService = async (id) => {
    const data = await GetMyApplicationResultModel(id)

    return {
        message : 'Get my application',
        data : data
    }
}   
