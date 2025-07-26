import Message from '../models/message.model.js'
import User from '../models/User.model.js'
import cloudinary from '../lib/cloudinary.js'
import { io, userSocketMap } from '../server.js'

// get all users except logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id
    const filteredUsers = await User.find({
      _id: { $ne: userId }
    }).select('-password')

    // count the number of messages not seen by the user
    const unseenMessages = {}
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false
      })
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length
      }
    })
    await Promise.all(promises)
    res.status(200).json({
      success: true,
      users: filteredUsers,
      unseenMessages
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

// get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params
    const myId = req.user._id
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId }
      ]
    })

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    )
    res.status(200).json({
      success: true,
      messages
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

// mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params

    const message = await Message.findByIdAndUpdate(
      messageId,
      { seen: true }
    )
    if (!message) {
      return res.status(404).json({ message: 'Message not found or already seen' })
    }
    res.status(200).json({
      success: true,
      message
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

// send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body
    const receiverId = req.params.id
    const senderId = req.user._id

    let imageUrl
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image)
      imageUrl = uploadResponse.secure_url
    }

    const newMessage = Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    })

    // emit the new message to the receiver's socket
    const receiverSocketId = userSocketMap[receiverId]
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage)
    }

    res.status(200).json({
      success: true,
      message: newMessage
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message || 'Internal server error' })
  }
}
