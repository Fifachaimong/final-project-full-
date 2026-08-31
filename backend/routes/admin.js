import express from 'express'
import { CreateUserByAdmin, DeleteUser, EditUser, GetUserByAdmin } from '../controller/admin.js'
import { createUserSchema, editUserSchema }from '../schema/admin.js'
import { ValidateBody } from '../middleware/validate.js'
import roleMiddleware from '../middleware/role.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/users', authMiddleware, roleMiddleware('admin'), GetUserByAdmin)
router.post('/users', authMiddleware, roleMiddleware('admin'), ValidateBody(createUserSchema), CreateUserByAdmin)
router.delete('/users/:id', authMiddleware, roleMiddleware('admin'), DeleteUser)
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), ValidateBody(editUserSchema), EditUser)

export default router


 /**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     description: Get a list of all users in the system.
 *     tags:
 *       - admin
 *
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Get User succeed"
 *               data:
 *                 - id: 6
 *                   firstname: "Naruechit"
 *                   lastname: "chaimongkon"
 *                   email: "Naruechit@gmail.com"
 *                   role: "applicant"
 *                   created_at: 2026-08-10T09:15:39.000Z
 *                 - id: 31
 *                   firstname: "Golf"
 *                   lastname: "mark"
 *                   email: "BakaZEno@gmail.com"
 *                   role: "hr"
 *                   created_at: "2026-08-23T09:15:39.000Z"
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
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user account and add the user to the system.
 *     tags:
 *       - admin
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
 *                 format: email
 *                 description: User email used for login
 *                 example: "Naruechit@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum:
 *                   - applicant
 *                   - hr
 *                   - admin
 *                 default: applicant
 *                 description: User role. Defaults to applicant if not provided.
 *                 example: "applicant"
 *
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Create user succeed"
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
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Delete a user account from the system by user ID.
 *     tags:
 *       - admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "1"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Delete user succeed"
 *
 *       400:
 *         description: User ID is required
 *         content:
 *           application/json:
 *             example:
 *               message: "User ID is required"
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
 * /admin/users/{id}:
 *   put:
 *     summary: Edit user
 *     description: Update a user's profile by user ID.
 *     tags:
 *       - admin
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "1"
 *
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
 *                 example: "123456789"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "12345678"
 *               role:
 *                 type: string
 *                 enum:
 *                   - applicant
 *                   - hr
 *                   - admin
 *                 description: User role
 *                 example: "applicant"
 *
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Edit user succeed"
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               message: "firstname must be a string"
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
