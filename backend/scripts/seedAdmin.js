require('dotenv').config()
const mongoose = require('mongoose')
const Admin = require('../models/Admin')

async function initAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/swad'
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME?.trim() || 'Swad Admin'

    if (!email || !password) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before seeding.')
    }
    if (password.length < 12) {
      throw new Error('ADMIN_PASSWORD must be at least 12 characters.')
    }

    const existingAdmin = await Admin.findOne({ email })

    if (existingAdmin) {
      existingAdmin.password = password
      existingAdmin.name = name
      await existingAdmin.save()
      console.log(`Admin account [${email}] updated successfully with configured password.`)
    } else {
      const newAdmin = new Admin({
        email,
        password,
        name,
      })
      await newAdmin.save()
      console.log(`Admin account [${email}] created successfully!`)
    }

    process.exit(0)
  } catch (error) {
    console.error('Error seeding admin:', error)
    process.exit(1)
  }
}

initAdmin()
