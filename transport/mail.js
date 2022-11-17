const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  service: 'Naver',
  host: 'smtp.naver.com',
  port: 587,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
})

module.exports = transport