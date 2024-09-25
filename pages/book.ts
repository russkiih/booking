import dotenv from 'dotenv';
dotenv.config();
import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import Cors from 'cors'

const cors = Cors({
  methods: ['POST', 'HEAD'],
})

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors)
  if (req.method === 'POST') {
    console.log('Received booking request:', req.body);
    const { service, date, time, name, email, phone } = req.body

    // Create a test account if you don't have real credentials
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    try {
      let info = await transporter.sendMail({
        from: '"Your Salon" <booking@yoursalon.com>',
        to: email,
        subject: "Booking Confirmation",
        text: `Dear ${name},\n\nYour appointment for ${service} on ${date} at ${time} has been confirmed.\n\nThank you for choosing our salon!`,
        html: `<p>Dear ${name},</p><p>Your appointment for <strong>${service}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been confirmed.</p><p>Thank you for choosing our salon!</p>`,
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      res.status(200).json({ message: 'Booking successful and confirmation email sent', previewUrl: nodemailer.getTestMessageUrl(info) })
    } catch (error) {
      console.error('Error sending email:', error)
      res.status(500).json({ message: 'Error processing booking', error: error.toString() })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);