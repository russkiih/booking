const nodemailer = require('nodemailer');

async function sendTestEmail() {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let info = await transporter.sendMail({
        from: '"Test User" <bookingapprusalina@gmail.com>',
        to: 'jenyapelican@gmail.com', // Replace with a valid recipient email
        subject: 'Test Email',
        text: 'This is a test email.',
        html: '<b>This is a test email.</b>',
    });

    console.log("Message sent: %s", info.messageId);
}

sendTestEmail().catch(console.error);