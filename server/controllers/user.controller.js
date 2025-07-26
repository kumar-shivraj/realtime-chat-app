import { generateToken } from '../lib/utils'
import User from '../models/User.model'
import bcrypt from 'bcryptjs'

// signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body
  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: 'All fields(fullName, email and password) are required.' })
    }

    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email.' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio
    })

    const token = generateToken(newUser._id)
    res.json({
      success: true,
      userData: newUser,
      token,
      message: 'Account created successfully'
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

// login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const userData = await User.findOne({ email })

    const isPasswordCorrect = await bcrypt.compare(password, userData.password)

    if (!userData || !isPasswordCorrect) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' })
    }

    const token = generateToken(userData._id)
    res.json({
      success: true,
      userData,
      token,
      message: 'Login successful'
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    })
  }
}

// check if user is authenticated
export const checkAuth = (req, res) => {
  if (req.user) {
    return res.json({ success: true, user: req.user })
  } else {
    return res.status(401).json({ success: false, message: 'Not authenticated' })
  }
}
