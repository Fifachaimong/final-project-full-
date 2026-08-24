import express from "express";
import { ApplyResume, EditMyProfile, GetMyApplicationResult, GetMyProfile, GetPost, GetPostByID, Login, Register } from "../controller/auth.js";
import { registerSchema, loginSchema, editMyProfileSchema } from "../schema/auth.js";
import { ValidateBody } from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";

const routes = express.Router()

routes.post('/register', ValidateBody(registerSchema), Register)
routes.post('/login', ValidateBody(loginSchema), Login)
routes.put('/profile', authMiddleware, upload.single('icon'), ValidateBody(editMyProfileSchema), EditMyProfile)
routes.get('/posts', authMiddleware, GetPost)
routes.get('/posts/:id', authMiddleware, GetPostByID)
routes.get('/profile', authMiddleware, GetMyProfile)
routes.get('/result', authMiddleware, GetMyApplicationResult)
routes.post("/apply/:postId", authMiddleware,
  upload.fields([
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

export default routes

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register
 *     description: Create a new user account.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User first name
 *                 example: "Naruechit"
 *               lastname:
 *                 type: string
 *                 description: User last name
 *                 example: "Chaimongkon"
 *               email:
 *                 type: string
 *                 description: User email used for login
 *                 example: "Naruechit@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "1234567Sk"
 *               role:
 *                 type: string
 *                 enum:
 *                   - applicant
 *                   - hr
 *                 default: applicant
 *                 description: User role. Defaults to applicant if not provided.
 *                 example: "applicant"
 *     responses:
 *       201:
 *         description: Successful register
 *         content:
 *           application/json:
 *             example:
 *               message: "Register succeed"
 *
 *       400:
 *         description: Validation error. The message indicates the invalid field and expected type.
 *         content:
 *           application/json:
 *             example:
 *               message: "email must be a string"
 *
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             example:
 *               message: "This email is already in use."
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
 * /auth/login:
 *   post:
 *     summary: Login
 *     description: Authenticate user and generate access token.
 *     tags:
 *       - auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email used for login
 *                 example: "Naruechit@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "1234567Sk"
 *
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             example:
 *               message: "Login succeed"
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *
 *       400:
 *         description: Validation error. The message indicates the invalid field and expected type.
 *         content:
 *           application/json:
 *             example:
 *               message: "email must be a string"
 *
 *       401:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             example:
 *               message: "Incorrect email or password."
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
 * /auth/profile:
 *   put:
 *     summary: Edit profile
 *     description: Update the authenticated user's profile.
 *     tags:
 *       - auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: User first name
 *                 example: "Naruechit"
 *               lastname:
 *                 type: string
 *                 description: User last name
 *                 example: "Chaimongkon"
 *               phone:
 *                 type: string
 *                 description: User phone number
 *                 example: "0999999990"
 *
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Edit my profile succeed"
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "firstname must be a string"
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
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /auth/posts:
 *   get:
 *     summary: View All Job Announcements
 *     description: Display all job announcement posts.
 *     tags:
 *       - auth
 *     responses:
 *       200:
 *         description: Successful response with all job announcement posts
 *         content:
 *           application/json:
 *             example:
 *               message: Get post succeed
 *               data:
 *                 - title: "dev"
 *                   owner_id: 1
 *                   faculty: "computer"
 *                   description: "I want to development web"
 *                   deadline: "2026-07-31"
 *                   firstname: "fifa"
 *                   lastname: "chaimongkon"
 * 
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: View My Profile
 *     description: Display the profile information of the currently authenticated user.
 *     tags:
 *       - auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response with the user's profile information
 *         content:
 *           application/json:
 *             example:
 *               message: "Get my profile succeed"
 *               data:
 *                 id: 7
 *                 firstname: "์Naruechit"
 *                 lastname: "Chaimongkon"
 *                 email: "fifakaijsu@sc"
 *                 phone: "0999999990"
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
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
