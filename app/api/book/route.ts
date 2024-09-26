import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Initialize Firebase (make sure to use your Firebase config)
const firebaseConfig = {
  // Your Firebase configuration
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received booking request:', body);
    const { service, date, time, name, email, phone } = body;

    // Create a test account for development
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

    // Send email confirmation
    let info = await transporter.sendMail({
      from: '"Rusalina Booking" <bookingapprusalina@gmail.com>',
      to: email,
      subject: "Booking Confirmation",
      text: `Dear ${name},\n\nYour appointment for ${service} on ${date} at ${time} has been confirmed.\n\nThank you for choosing our salon!`,
      html: `<p>Dear ${name},</p><p>Your appointment for <strong>${service}</strong> on <strong>${new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</strong> at <strong>${time}</strong> has been confirmed.</p><p>Thank you for choosing our salon!</p>`,
    });

    console.log("Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Send SMS confirmation using Firebase Cloud Function
    // Commented out for now to isolate the issue
    // const sendSMS = httpsCallable(functions, 'sendSMS');
    // const smsResult = await sendSMS({
    //   phone: phone,
    //   message: `Your appointment for ${service} on ${new Date(date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} at ${time} has been confirmed. Thank you for choosing our salon!`
    // });
    // console.log("SMS sent:", smsResult.data);

    return NextResponse.json({ message: 'Booking successful. Confirmation email sent.', previewUrl: nodemailer.getTestMessageUrl(info) });
  } catch (error) {
    console.error('Error processing booking:', error);
    return NextResponse.json({ message: 'Error processing booking', error: error.toString() }, { status: 500 });
  }
}

// Log environment variables (for debugging purposes)
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);