var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pavangowdats10@gmail.com',
    pass: 'Pavants777@'
  }
});