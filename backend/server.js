require('dotenv').config()

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters.')
}

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const path = require('path')
const recipeRoutes = require('./routes/recipeRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()
const port = process.env.PORT || 5000

// Allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true)
      }
      return callback(null, true) // Allow frontend on any deployed domain
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Database connection for Serverless & Local
let isConnected = false
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swad'
  await mongoose.connect(mongoUri)
  isConnected = true
}

// Ensure DB is connected before handling API requests
app.use(async (req, res, next) => {
  try {
    await connectDB()
  } catch (err) {
    console.error('Database connection error:', err.message)
  }
  next()
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/recipes', recipeRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Swad server is running smoothly!',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

async function startServer() {
  try {
    await connectDB()
    console.log('Connected to MongoDB')
    app.listen(port, () => {
      console.log(`Swad server is running on port ${port}`)
    })
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message)
    app.listen(port, () => {
      console.log(`Swad server listening on port ${port} (waiting for MongoDB...)`)
    })
  }
}

if (process.env.VERCEL !== '1') {
  startServer()
}

module.exports = app
