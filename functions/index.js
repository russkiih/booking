const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

const twilioClient = twilio(functions.config().twilio.account_sid, functions.config().twilio.auth_token);

exports.sendSMS = functions.https.onCall(async (data, context) => {
  const { phone, message } = data;

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: functions.config().twilio.phone_number,
      to: phone
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send SMS');
  }
});