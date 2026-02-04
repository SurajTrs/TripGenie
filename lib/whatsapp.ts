import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

let client: twilio.Twilio | null = null;

// Only initialize Twilio client if valid credentials are provided
if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length > 10) {
  try {
    client = twilio(accountSid, authToken);
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error);
    client = null;
  }
}

interface BookingDetails {
  bookingId: string;
  customerName: string;
  from: string;
  to: string;
  date: string;
  transportType: string;
  transportDetails: string;
  hotelName?: string;
  totalAmount: number;
  paymentStatus: string;
}

interface ReschedulingDetails {
  bookingId: string;
  customerName: string;
  originalDate: string;
  newDate: string;
  transportType: string;
}

/**
 * Send booking confirmation via WhatsApp
 */
export async function sendBookingConfirmation(
  phoneNumber: string,
  bookingDetails: BookingDetails
): Promise<boolean> {
  if (!client) {
    console.error('Twilio client not initialized. Check environment variables.');
    return false;
  }

  try {
    const message = `
✅ *Booking Confirmed - TravixAI*

🎫 Booking ID: ${bookingDetails.bookingId}
👤 Name: ${bookingDetails.customerName}

📍 From: ${bookingDetails.from}
📍 To: ${bookingDetails.to}
📅 Date: ${bookingDetails.date}

🚀 Transport: ${bookingDetails.transportType}
${bookingDetails.transportDetails}

${bookingDetails.hotelName ? `🏨 Hotel: ${bookingDetails.hotelName}\n` : ''}
💰 Total: ₹${bookingDetails.totalAmount.toLocaleString()}
💳 Payment: ${bookingDetails.paymentStatus}

Thank you for choosing TravixAI! 🌟
Have a wonderful trip!

Need help? Reply to this message.
    `.trim();

    const result = await client.messages.create({
      body: message,
      from: whatsappNumber!,
      to: `whatsapp:${phoneNumber}`,
    });

    console.log('WhatsApp booking confirmation sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp booking confirmation:', error);
    return false;
  }
}

/**
 * Send payment confirmation via WhatsApp
 */
export async function sendPaymentConfirmation(
  phoneNumber: string,
  bookingId: string,
  amount: number,
  paymentMethod: string,
  transactionId: string
): Promise<boolean> {
  if (!client) {
    console.error('Twilio client not initialized.');
    return false;
  }

  try {
    const message = `
💳 *Payment Successful - TravixAI*

✅ Your payment has been processed!

🎫 Booking ID: ${bookingId}
💰 Amount Paid: ₹${amount.toLocaleString()}
💳 Payment Method: ${paymentMethod}
🔐 Transaction ID: ${transactionId}

Your tickets will be sent shortly.

Questions? Reply to this message.
    `.trim();

    const result = await client.messages.create({
      body: message,
      from: whatsappNumber!,
      to: `whatsapp:${phoneNumber}`,
    });

    console.log('WhatsApp payment confirmation sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp payment confirmation:', error);
    return false;
  }
}

/**
 * Send ticket details with PDF/attachment
 */
export async function sendTicketDetails(
  phoneNumber: string,
  bookingId: string,
  ticketUrl?: string
): Promise<boolean> {
  if (!client) {
    console.error('Twilio client not initialized.');
    return false;
  }

  try {
    const messageData: any = {
      body: `🎫 *Your Tickets - TravixAI*\n\nBooking ID: ${bookingId}\n\nYour tickets are ready! ${ticketUrl ? 'See attached document.' : 'Check your email for details.'}`,
      from: whatsappNumber!,
      to: `whatsapp:${phoneNumber}`,
    };

    // If you have a publicly accessible ticket URL (PDF)
    if (ticketUrl) {
      messageData.mediaUrl = [ticketUrl];
    }

    const result = await client.messages.create(messageData);

    console.log('WhatsApp ticket sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp ticket:', error);
    return false;
  }
}

/**
 * Send rescheduling confirmation
 */
export async function sendReschedulingConfirmation(
  phoneNumber: string,
  details: ReschedulingDetails
): Promise<boolean> {
  if (!client) {
    console.error('Twilio client not initialized.');
    return false;
  }

  try {
    const message = `
🔄 *Booking Rescheduled - TravixAI*

✅ Your booking has been rescheduled!

🎫 Booking ID: ${details.bookingId}
👤 Name: ${details.customerName}
🚀 Transport: ${details.transportType}

📅 Original Date: ${details.originalDate}
📅 New Date: ${details.newDate}

Updated tickets will be sent to your email.

Questions? Reply to this message.
    `.trim();

    const result = await client.messages.create({
      body: message,
      from: whatsappNumber!,
      to: `whatsapp:${phoneNumber}`,
    });

    console.log('WhatsApp rescheduling confirmation sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp rescheduling confirmation:', error);
    return false;
  }
}

/**
 * Send general notification
 */
export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  if (!client) {
    console.error('Twilio client not initialized.');
    return false;
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: whatsappNumber!,
      to: `whatsapp:${phoneNumber}`,
    });

    console.log('WhatsApp notification sent:', result.sid);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Handle incoming WhatsApp messages (for rescheduling requests)
 */
export function parseIncomingWhatsAppMessage(body: string): {
  intent: 'reschedule' | 'cancel' | 'query' | 'unknown';
  bookingId?: string;
  newDate?: string;
} {
  const lowerBody = body.toLowerCase();

  // Check for rescheduling intent
  if (lowerBody.includes('reschedule') || lowerBody.includes('change date')) {
    // Try to extract booking ID (format: BOOK-XXXXXX)
    const bookingIdMatch = body.match(/BOOK-\w+/i);
    const bookingId = bookingIdMatch ? bookingIdMatch[0] : undefined;

    // Try to extract date
    const dateMatch = body.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);
    const newDate = dateMatch ? dateMatch[0] : undefined;

    return { intent: 'reschedule', bookingId, newDate };
  }

  // Check for cancellation intent
  if (lowerBody.includes('cancel')) {
    const bookingIdMatch = body.match(/BOOK-\w+/i);
    const bookingId = bookingIdMatch ? bookingIdMatch[0] : undefined;
    return { intent: 'cancel', bookingId };
  }

  // Check for general query
  if (lowerBody.includes('status') || lowerBody.includes('help') || lowerBody.includes('?')) {
    return { intent: 'query' };
  }

  return { intent: 'unknown' };
}

export default {
  sendBookingConfirmation,
  sendPaymentConfirmation,
  sendTicketDetails,
  sendReschedulingConfirmation,
  sendWhatsAppNotification,
  parseIncomingWhatsAppMessage,
};
