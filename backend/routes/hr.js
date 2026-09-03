import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { createPostSchema, editPostSchema, updateCandidateStatusSchema } from '../schema/hr.js'
import { ValidateBody } from '../middleware/validate.js'
import roleMiddleware from '../middleware/role.js'
import upload from "../middleware/upload.js";
import { CreatePost, DeleteMemberInPost, DeletePost, EditPost, GetMember, GetMemberResumeResult, GetMyPost, GetProfileByMember, UpdateCandidateStatus } from '../controller/hr.js'

const router = express.Router()

router.get('/posts', authMiddleware, roleMiddleware('hr'), GetMyPost)
router.get('/posts/:post_id/members', authMiddleware, roleMiddleware('hr', 'admin'), GetMember)
router.get('/members/:id/profile/', authMiddleware, roleMiddleware('hr', 'admin'), GetProfileByMember)
router.get('/posts/:post_id/members/:id', authMiddleware, roleMiddleware('hr', 'admin'), GetMemberResumeResult)
router.post('/posts', authMiddleware, roleMiddleware('hr', 'admin'), upload.single('icon'), ValidateBody(createPostSchema), CreatePost)
router.put('/posts/:id', authMiddleware, roleMiddleware('hr', 'admin'), upload.single('icon'), ValidateBody(editPostSchema), EditPost)
router.put('/posts/:post_id/members/:id', authMiddleware, roleMiddleware('hr', 'admin'), ValidateBody(updateCandidateStatusSchema), UpdateCandidateStatus)
router.delete('/posts/:id', authMiddleware, roleMiddleware('hr', 'admin'), DeletePost)
router.delete('/posts/:post_id/members/:id', authMiddleware, roleMiddleware('hr', 'admin'), DeleteMemberInPost)

export default router

/**
 * @swagger
 * /hr/members:
 *   get:
 *     summary: Get HR members
 *     description: Retrieve a list of members for HR.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Members retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Get my member succeed"
 *               data:
 *                 - Post_id: 6
 *                   user_id: 6
 *                   user_firstname: "Golf"
 *                   user_lastname: "Matin"
 *                   ai_score: "65.90"
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /hr/members/profile/{id}:
 *   get:
 *     summary: Get member profile
 *     description: Retrieve a member profile by user ID.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Member user ID
 *         example: 6
 *     responses:
 *       200:
 *         description: Member profile retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Get member profile succeed"
 *               data:
 *                 user_id: 6
 *                 user_firstname: "Golf"
 *                 user_lastname: "Matin"
 *                 user_email: "Golfy@gmail.com"
 *                 user_phone: "099999999"
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Member not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /hr/members/{id}:
 *   get:
 *     summary: Get member resume analysis
 *     description: Retrieve the AI analysis result of a member's resume.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the member
 *         example: 2
 *
 *     responses:
 *       200:
 *         description: Member resume analysis retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Get analysis of members resumes"
 *               data:
 *                 ai_score: "65.90"
 *                 ai_analysis: "The candidate has strong technical skills and relevant experience for this position."
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       404:
 *         description: Member not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Member not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /hr/posts:
 *   post:
 *     summary: Create a new post
 *     description: Create a new post for the authenticated HR user.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - faculty
 *               - description
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *                 example: "รับสมัครนักศึกษาฝึกงาน"
 *               faculty:
 *                 type: string
 *                 description: Faculty related to the post
 *                 example: "Faculty of Engineering"
 *               description:
 *                 type: string
 *                 description: Post description
 *                 example: "เปิดรับสมัครนักศึกษาฝึกงานสำหรับภาคเรียนที่ 1"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Application deadline
 *                 example: "2026-08-01"
 *
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Create post succeed"
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "title must be a string"
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error."
 */

/**
 * @swagger
 * /hr/posts/{id}:
 *   put:
 *     summary: Edit an existing post
 *     description: Edit an existing post for the authenticated HR user.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post
 *         example: 2
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *                 example: "รับสมัครนักศึกษาฝึกงาน"
 *               faculty:
 *                 type: string
 *                 description: Faculty related to the post
 *                 example: "Faculty of Engineering"
 *               description:
 *                 type: string
 *                 description: Post description
 *                 example: "เปิดรับสมัครนักศึกษาฝึกงานสำหรับภาคเรียนที่ 1"
 *               deadline:
 *                 type: string
 *                 format: date
 *                 description: Application deadline
 *                 example: "2026-08-01"
 *
 *     responses:
 *       200:
 *         description: Post edited successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Edit posts succeed"
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "title must be a string"
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error."
 */

/**
 * @swagger
 * /hr/members/{id}:
 *   put:
 *     summary: Update candidate status
 *     description: Update the status of a candidate for the authenticated HR user.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the candidate member
 *         example: 2
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - accepted
 *                   - rejected
 *                 default: pending
 *                 description: Candidate application status
 *                 example: accepted
 *
 *     responses:
 *       200:
 *         description: Candidate status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Update applicant status"
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "status must be a pending,accepted,rejected"
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       404:
 *         description: Candidate not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Member not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error."
 */

/**
 * @swagger
 * /hr/posts/{id}:
 *   delete:
 *     summary: Delete an existing post
 *     description: Delete a post owned by the authenticated HR user.
 *     tags:
 *       - hr
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the post to delete
 *         example: 2
 *
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Delete post succeed"
 *
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             examples:
 *               missing_token:
 *                 summary: Missing token
 *                 value:
 *                   message: "Unauthorization"
 *               invalid_token:
 *                 summary: Invalid token
 *                 value:
 *                   message: "Invalid token"
 *
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error."
 */