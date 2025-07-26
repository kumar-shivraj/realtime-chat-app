import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import connectDB from './lib/db.js'
import userRouter from './routes/user.route.js'
import messageRouter from './routes/message.route.js'
import { Server } from 'socket.io'

// create express app using HTTP server, because socket.io needs an HTTP server
const app = express()
const server = http.createServer(app)

// initialize socket.io server
export const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

// store online users
export const userSocketMap = {} // {userId: socketId}

// socket.io connection handler
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId
  console.log('A user connected:', socket.id)

  if (userId) { userSocketMap[userId] = socket.id }

  // emit online users to all connected clients
  io.emit('getOnlineUsers', Object.keys(userSocketMap))

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
    delete userSocketMap[userId]
    io.emit('getOnlineUsers', Object.keys(userSocketMap))
  })
})

// middleware setup
app.use(express.json({ limit: '4mb' }))
app.use(cors())

// routes setup
app.use('/api/status', (req, res) => {
  res.status(200).json({ status: 'Server is live' })
})
app.use('/api/auth', userRouter)
app.use('/api/messages', messageRouter)

// connect to MongoDB
await connectDB()

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
