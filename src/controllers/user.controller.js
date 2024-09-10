import User from '../models/user.modal.js'
import { ApiError, ApiResponse, asyncHandler } from '../utils/apiUtils.js'

// Create a new user
export const CreateUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, roles } = req.body
  try {
    // Check if user already exists
    const userExist = await User.findOne({ email })
    if (userExist) {
      return next(new ApiError(400, 'User already exists'))
    }
    const user = new User({ name, email, password, roles })
    await user.save()
    res.status(201).json(new ApiResponse(201, user, 'User created successfully'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})

// Get all users
export const GetAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const { isDeleted = false, currentPage = 1, limit = 10, search, filter, sortColumn, sortOrder } = req.query
    // Build the query object
    const query = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }
    if (filter) {
      query.roles = { $in: filter.split(',') }
    }
    query.isDeleted = isDeleted
    // Build the sort object
    const sort = {}
    if (sortColumn && sortOrder) {
      sort[sortColumn] = sortOrder === 'asc' ? 1 : -1
    }

    // Fetch users with pagination and sorting
    const users = await User.find(query)
      .sort(sort) // Apply sorting here
      .limit(limit * 1)
      .skip((currentPage - 1) * limit)

    const total = await User.countDocuments(query)

    // Calculate the total number of pages
    const pages = Math.ceil(total / limit)

    res.status(200).json(new ApiResponse(200, { users, total, pages }, 'Users retrieved successfully'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})

// Get user by ID
export const GetUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  try {
    const user = await User.findById(id)
    if (!user) {return next(new ApiError(404, 'User not found'))}
    res.status(200).json(new ApiResponse(200, user, 'User retrieved successfully'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})

// Update user by ID
export const UpdateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  const { name, email, password, roles, status } = req.body
  try {
    // Check if user already exists but exclude the current user
    const userExist = await User.findOne({ email, _id: { $ne: id } })
    if (userExist) {
      return next(new ApiError(400, 'User with this email already exists'))
    }
    // Update user
    const user = await User.findByIdAndUpdate(id, { name, email, password, roles, status }, { new: true })
    if (!user) {return next(new ApiError(404, 'User not found'))}
    res.status(200).json(new ApiResponse(200, user, 'User updated successfully'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})

// Soft delete user by ID
export const SoftDeleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  try {
    // Soft delete user and set status to inactive
    const user = await User.findByIdAndUpdate(id, { status: 'inactive', isDeleted: true }, { new: true })
    if (!user) {return next(new ApiError(404, 'User not found'))}
    res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})

// Restore user by ID
export const RestoreUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  try {
    // Restore user and set status to active
    const user = await User.findByIdAndUpdate(id, { status: 'active', isDeleted: false }, { new: true })
    if (!user) {return next(new ApiError(404, 'User not found'))}
    res.status(200).json(new ApiResponse(200, null, 'User restored successfully'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})

// Permanently delete user by ID
export const PermanentDeleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  try {
    // Permanently delete user
    const user = await User.findByIdAndDelete(id)
    if (!user) {return next(new ApiError(404, 'User not found'))}
    res.status(200).json(new ApiResponse(200, null, 'User deleted permanently'))
  } catch (error) {
    next(new ApiError(500, 'Internal server error', [error.message]))
  }
})
