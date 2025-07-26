import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'

// middleware to protect routes
export const protectRoute = async (req, res, next) => {
  console.log('inside protectRoute middleware')
  try {
    const token = req.headers.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.json({ success: false, message: 'Not authorized, user not found' })
    }
    req.user = user
    next()
  } catch (error) {
    console.log(error.message)
    return res.json({ success: false, message: error.message || 'Not authorized, token failed' })
  }
}
