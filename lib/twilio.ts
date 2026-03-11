import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

export const twilioClient = twilio(accountSid, authToken);

export function getWhatsAppNumber(): string {
  const num = process.env.TWILIO_WHATSAPP_NUMBER;
  if (!num) throw new Error("TWILIO_WHATSAPP_NUMBER is not set");
  return num.startsWith("whatsapp:") ? num : `whatsapp:${num}`;
}

export function getSmsNumber(): string {
  return process.env.TWILIO_PHONE_NUMBER!;
}

export async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  const from = getWhatsAppNumber();
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  await twilioClient.messages.create({
    from,
    to: toFormatted,
    body,
  });
}

export async function sendSms(to: string, body: string): Promise<void> {
  await twilioClient.messages.create({
    from: getSmsNumber(),
    to,
    body,
  });
}
