const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { Readable } = require('stream')
const fs = require('fs')
const path = require('path')

// Directory for local uploads fallback
const localUploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true })
}

function sanitizeCredential(val) {
  if (!val) return ''
  return val
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s*(api\s*secret|api\s*key|cloud\s*name)\s*$/i, '')
    .trim()
}

const cloudName = sanitizeCredential(process.env.CLOUDINARY_CLOUD_NAME)
const apiKey = sanitizeCredential(process.env.CLOUDINARY_API_KEY)
const apiSecret = sanitizeCredential(process.env.CLOUDINARY_API_SECRET)

// Check if valid Cloudinary credentials are provided
const hasCloudinary =
  cloudName &&
  cloudName !== 'your_cloud_name' &&
  apiKey &&
  apiKey !== 'your_api_key' &&
  apiSecret &&
  apiSecret !== 'your_api_secret'

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  })
}

// Memory storage for incoming uploads
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'))
    }
    cb(null, true)
  },
})

// Streams a buffer to Cloudinary (or falls back to local disk storage)
async function uploadToCloudinary(buffer, folder = 'swad-recipes', originalName = 'dish.jpg', host = 'localhost:5000') {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 1200, height: 900, crop: 'limit', quality: 'auto:good' },
          ],
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      Readable.from(buffer).pipe(stream)
    })
  }

  // Local fallback: Save buffer to uploads folder
  const ext = path.extname(originalName) || '.jpg'
  const filename = `recipe-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
  const filePath = path.join(localUploadsDir, filename)

  await fs.promises.writeFile(filePath, buffer)

  const serverUrl = process.env.SERVER_URL || `http://${host}`
  return {
    secure_url: `${serverUrl}/uploads/${filename}`,
    public_id: `local:${filename}`,
  }
}

// Deletes an image from Cloudinary or local disk
async function deleteFromCloudinary(publicId) {
  if (!publicId) return
  if (publicId.startsWith('local:')) {
    const filename = publicId.replace('local:', '')
    const filePath = path.join(localUploadsDir, filename)
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
      }
    } catch (err) {
      console.error('Local file delete error:', err.message)
    }
    return
  }

  if (hasCloudinary) {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (err) {
      console.error('Cloudinary delete error:', err.message)
    }
  }
}

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary }
