import express from 'express'
import {
  CreateUser,
  GetAllUsers,
  GetUserById,
  UpdateUser,
  SoftDeleteUser,
  RestoreUser,
  PermanentDeleteUser
} from '../controllers/user.controller.js'

const router = express.Router()

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               role:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/create', CreateUser)

/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: Retrieve all users with optional filters, sorting, and pagination
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: isDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Filter by deleted status (default is false)
 *       - in: query
 *         name: currentPage
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The current page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter by roles (comma-separated list)
 *       - in: query
 *         name: sortColumn
 *         schema:
 *           type: string
 *         description: Column name to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc for ascending, desc for descending)
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number
 *                 totalPages:
 *                   type: integer
 *                   description: Total number of pages
 *                 totalRecords:
 *                   type: integer
 *                   description: Total number of records
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/all', GetAllUsers)

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Retrieve a single user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', GetUserById)

/**
 * @swagger
 * /user/update/{id}:
 *   patch:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "john_doe_updated"
 *               email:
 *                 type: string
 *                 example: "john.doe.updated@example.com"
 *               role:
 *                 type: string
 *                 example: "user"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/update/:id', UpdateUser)

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user by ID (soft delete)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', SoftDeleteUser)

/**
 * @swagger
 * /user/restore/{id}:
 *   patch:
 *     summary: Restore a soft-deleted user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to restore
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/restore/:id', RestoreUser)

/**
 * @swagger
 * /user/delete/{id}:
 *   delete:
 *     summary: Permanently delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete permanently
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted permanently
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', PermanentDeleteUser)

export default router
