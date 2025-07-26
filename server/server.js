import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import connectDB from './lib/db.js'
import userRouter from './routes/user.route.js'

// create express app using HTTP server, because socket.io needs an HTTP server
const app = express()
const server = http.createServer(app)

// middleware setup
app.use(express.json({ limit: '4mb' }))
app.use(cors())

// route setup
app.use('/api/status', (req, res) => {
  res.status(200).json({ status: 'Server is live' })
})
app.use('/api/auth', userRouter)

// connect to MongoDB
await connectDB()

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
