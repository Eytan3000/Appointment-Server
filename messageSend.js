import twilio from 'twilio';
// import { twiml } from 'twilio';
// const { MessagingResponse } = twiml;

export function formulateNewSummaryClientMsg(
  Clientname,
  Ownername,
  date,
  startTime,
  duration,
  businessAddress
) {
  // return `היי ${Clientname}, נקבעה לך פגישה עם ${Ownername} בתאריך ${date} בשעה ${startTime}. כתובת: ${businessAddress}. משך הטיפול ${duration} דקות.`;
  return `Hello ${Clientname}, you've scheduled an appointment with ${Ownername} on ${date} at ${startTime}. The session, located at ${businessAddress}, is expected to last for ${duration} minutes.`;
}

export async function sendWhatsappMessage(message, phone) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = twilio(accountSid, authToken);
  console.log(phone);

  const response = await client.messages.create({
    body: message,
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:' + phone,
  });

  return response;
}
