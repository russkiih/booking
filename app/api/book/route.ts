import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  const body = await request.json();
  console.log('Received booking request:', body);
  const { service, date, time, name, email, phone } = body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: '"Rusalina Booking" <bookingapprusalina@gmail.com>',
      to: email,
      subject: "Booking Confirmation",
      text: `Dear ${name},\n\nYour appointment for ${service} on ${date} at ${time} has been confirmed.\n\nThank you for choosing our salon!`,
      html: `<p>Dear ${name},</p><p>Your appointment for <strong>${service}</strong> on <strong>${new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</strong> at <strong>${time}</strong> has been confirmed.</p><p>Thank you for choosing our salon!</p>`,
    });

    console.log("Message sent: %s", info.messageId);

    return NextResponse.json({ message: 'Booking successful and confirmation email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error processing booking', error: error.toString() }, { status: 500 });
  }
}

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS); // Ensure this is the app password if using 2FA