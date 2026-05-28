const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Transporter banayein (Gmail use kar rahe hain)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Aapka Gmail
            pass: process.env.EMAIL_PASS  // Aapka App Password
        }
    });

    // 2. Email options define karein
    const mailOptions = {
        from: `"Drive Now Fleet" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // 3. Email bhejein
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;