const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  service: 'Naver',
  host: 'smtp.naver.com',
  port: 587,
  secure: false,
  auth: {
    user: 'ektmf1101@naver.com',
    pass: '0231-ektmf!',
  },
})

module.exports = transport