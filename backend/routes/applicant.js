import express from "express";
import { ApplyResume, CreateUploadSignature, GetMyApplicationResult, GetPost } from "../controller/applicant.js";
import roleMiddleware from "../middleware/role.js";
import { uploadPdf } from "../middleware/upload.js";
import { ValidateBody } from "../middleware/validate.js";
import { uploadSignatureSchema } from "../schema/applicant.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router()

router.get('/posts', authMiddleware, roleMiddleware('applicant', 'admin'), GetPost)
router.get('/result', authMiddleware, roleMiddleware('applicant'), GetMyApplicationResult)
router.post('/upload-signature', authMiddleware, roleMiddleware('applicant'), ValidateBody(uploadSignatureSchema), CreateUploadSignature)
router.post("/apply/:postId", authMiddleware, roleMiddleware('applicant'),
  uploadPdf.fields([
    {
      name: "resume",
      maxCount: 1,
    },
    {
      name: "transcript",
      maxCount: 1,
    },
  ]),
  ApplyResume
);

export default router

/**
 * @swagger
 * /applicant/upload-signature:
 *   post:
 *     summary: Get a signed upload for resume/transcript
 *     description: >
 *       Returns signed parameters so the browser can upload a PDF straight to
 *       Cloudinary (bypassing the 4.5 MB request limit of the frontend host).
 *       POST the file as multipart/form-data to `upload_url` with the fields
 *       `file`, `api_key`, `timestamp`, `signature`, `public_id`, `allowed_formats`
 *       (exactly as returned), then call `/applicant/apply/{postId}` with the
 *       resulting `public_id` values.
 *     tags:
 *       - applicant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum:
 *                   - resume
 *                   - transcript
 *               filename:
 *                 type: string
 *                 example: "my-resume.pdf"
 *               size:
 *                 type: number
 *                 description: File size in bytes (max 5 MB) for early rejection
 *                 example: 2097152
 *     responses:
 *       200:
 *         description: Signed upload parameters
 *       400:
 *         description: Invalid type or file size
 *
 * /applicant/apply/{postId}:
 *   post:
 *     summary: Apply to a post
 *     description: >
 *       Send either multipart/form-data with `resume` and `transcript` PDF files,
 *       or JSON with the `public_id` of files already uploaded through
 *       `/applicant/upload-signature`.
 *     tags:
 *       - applicant
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resume_public_id
 *               - transcript_public_id
 *             properties:
 *               resume_public_id:
 *                 type: string
 *               transcript_public_id:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               transcript:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Applied
 *       400:
 *         description: Missing or invalid files
 *       409:
 *         description: Already applied, or file already used
 *       413:
 *         description: File too large
 */

