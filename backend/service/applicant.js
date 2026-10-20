import { CreateMember, CreateResume, GetMemberByUserAndPost, GetMyApplicationResultModel, GetDataPostById, GetPostModel, IsUploadUrlUsed } from "../models/applicant.js"
import { GetTotalPage } from "../models/auth.js";
import AppError from '../utils/AppError.js'
import { UploadToCloudinary } from "../utils/UploadToCloudinary.js";
import { CreateUploadSignature, DeleteAssets, ResolveDirectUpload } from "../utils/DirectUpload.js";
import axios from "axios"

const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "https://duckling-hangup-resistant.ngrok-free.dev").replace(/\/+$/, "")
const AI_SERVICE_TOKEN = process.env.AI_SERVICE_TOKEN
const AI_TIMEOUT_MS = 180000

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

const CallAiService = async (body) => {
    const headers = {}
    if (AI_SERVICE_TOKEN) headers["X-AI-Token"] = AI_SERVICE_TOKEN

    try {
        return await axios.post(`${AI_SERVICE_URL}/analyze`, body, { headers, timeout: AI_TIMEOUT_MS })
    } catch (err) {
        const status = err.response?.status
        console.error("AI service error:", status, err.response?.data || err.message)

        if (status === 401) {
            throw new AppError("AI service authentication failed. Please contact the administrator.", 503)
        }
        if (!err.response || [404, 502, 503, 504].includes(status)) {
            throw new AppError("AI service is currently unavailable. Please try again later.", 503)
        }
        const detail = typeof err.response.data?.detail === "string" ? err.response.data.detail : "AI analysis failed"
        throw new AppError(detail, status >= 500 ? 502 : 422)
    }
}

const IsPdfBuffer = (buffer) =>
    Buffer.isBuffer(buffer) && buffer.subarray(0, 5).toString("latin1") === "%PDF-";

const UploadFromMultipart = async (files) => {
    const resume = files?.resume?.[0];
    const transcript = files?.transcript?.[0];

    if (!resume || !transcript) {
        throw new AppError(
            "Please upload resume and transcript",
            400
        );
    }

    if (!IsPdfBuffer(resume.buffer)) {
        throw new AppError("ไฟล์ Resume ต้องเป็น PDF เท่านั้น", 400, "resume");
    }

    if (!IsPdfBuffer(transcript.buffer)) {
        throw new AppError("ไฟล์ Transcript ต้องเป็น PDF เท่านั้น", 400, "transcript");
    }

    const results = await Promise.allSettled([
        UploadToCloudinary(resume.buffer, resume.mimetype, "resume", resume.originalname),
        UploadToCloudinary(transcript.buffer, transcript.mimetype, "transcript", transcript.originalname),
    ]);

    const assets = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => ({ publicId: r.value.path, resourceType: r.value.resourceType }));

    const failed = results.find((r) => r.status === "rejected");

    if (failed) {
        console.error("Upload to Cloudinary failed:", failed.reason);
        await DeleteAssets(assets);
        throw new AppError("อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", 502);
    }

    const [resumeUpload, transcriptUpload] = results.map((r) => r.value);

    return {
        resumeUrl: resumeUpload.publicUrl,
        transcriptUrl: transcriptUpload.publicUrl,
        assets,
    };
};

const ResolveDirectUploads = async (userId, body) => {
    const { resume_public_id, transcript_public_id } = body;

    if (!resume_public_id || !transcript_public_id) {
        throw new AppError(
            "Please upload resume and transcript",
            400
        );
    }

    const [resume, transcript] = await Promise.all([
        ResolveDirectUpload(userId, "resume", resume_public_id),
        ResolveDirectUpload(userId, "transcript", transcript_public_id),
    ]);

    if (await IsUploadUrlUsed(resume.url, transcript.url)) {
        throw new AppError("ไฟล์นี้ถูกใช้ในการสมัครไปแล้ว กรุณาอัปโหลดไฟล์ใหม่", 409);
    }

    return {
        resumeUrl: resume.url,
        transcriptUrl: transcript.url,
        assets: [resume, transcript],
    };
};

export const CreateUploadSignatureService = async (userId, body) => {
    return {
        message : "Create upload signature succeed",
        data : CreateUploadSignature(userId, body)
    };
};

export const ApplyResumeService = async (
    userId,
    postId,
    files,
    body = {},
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

    const isDirectUpload = Boolean(
        body?.resume_public_id || body?.transcript_public_id
    );

    const uploaded = isDirectUpload
        ? await ResolveDirectUploads(userId, body)
        : await UploadFromMultipart(files);

    try {
        const aiResult = await CallAiService({
            resume_url : uploaded.resumeUrl,
            job_text : post.description,
            model_provider: post.model_provider || undefined,
            faculty_match: post.faculty,
            job_title : post.title
        });

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

        const data = {
            memberId : memberId,
            resumeUrl : uploaded.resumeUrl,
            transcriptUrl : uploaded.transcriptUrl,
            aiScore : aiResult.data.matching_score,
            skills : `${aiResult.data.skills?.hard ?? ""}`,
            storytelling_score : aiResult.data.storytelling_score,
            ai_reason : aiResult.data.ai_reason,
            overall_confidence : aiResult.data.overall_confidence,
            specific_strengths : aiResult.data.specific_strengths,
            faculty_match : aiResult.data.faculty_match,
            resume_quality_score : aiResult.data.resume_quality_score,
            recommendation_reason : aiResult.data.recommendation_reason
        }

        await CreateResume(data);

        return {
            message: "Apply resume succeed",
            score: aiResult.data.matching_score,
            analysis: analysis
        };
    } catch (err) {
        if (!isDirectUpload) {
            await DeleteAssets(uploaded.assets);
        }

        throw err;
    }
};

export const GetMyApplicationResultService = async (id) => {
    const data = await GetMyApplicationResultModel(id)

    return {
        message : 'Get my application',
        data : data
    }
}
