import { NextRequest, NextResponse } from 'next/server';
import { parseIncomingWhatsAppMessage, sendWhatsAppNotification } from '@/lib/whatsapp';

/**
 * Webhook to receive incoming WhatsApp messages from Twilio
 * This handles rescheduling requests, cancellations, and queries
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const from = formData.get('From') as string; // Format: whatsapp:+1234567890
    const body = formData.get('Body') as string;
    const messageId = formData.get('MessageSid') as string;

    console.log('Received WhatsApp message:', { from, body, messageId });

    // Remove 'whatsapp:' prefix to get phone number
    const phoneNumber = from?.replace('whatsapp:', '');

    if (!body) {
      return NextResponse.json({ error: 'No message body' }, { status: 400 });
    }

    // Parse the message to determine intent
    const parsed = parseIncomingWhatsAppMessage(body);

    // Handle different intents
    switch (parsed.intent) {
      case 'reschedule':
        if (parsed.bookingId) {
          if (parsed.newDate) {
            // Call the rescheduling API
            try {
              const rescheduleResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bookings/reschedule`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    bookingId: parsed.bookingId,
                    newDate: parsed.newDate,
                    phoneNumber: phoneNumber
                  })
                }
              );

              const result = await rescheduleResponse.json();

              if (result.success) {
                // Success message is sent by the reschedule API via sendReschedulingConfirmation
                console.log('Rescheduling successful:', result);
              } else {
                await sendWhatsAppNotification(
                  phoneNumber,
                  `❌ Rescheduling Failed\n\n${result.error || 'Unable to process your request.'}\n\nPlease contact support: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
                );
              }
            } catch (error) {
              console.error('Rescheduling error:', error);
              await sendWhatsAppNotification(
                phoneNumber,
                `⚠️ Error Processing Request\n\nWe encountered an error while processing your rescheduling request.\n\nPlease try again or contact support.`
              );
            }
          } else {
            await sendWhatsAppNotification(
              phoneNumber,
              `📅 Please provide the new date\n\nBooking ID: ${parsed.bookingId}\n\nFormat: "Reschedule ${parsed.bookingId} to DD/MM/YYYY"\nExample: "Reschedule ${parsed.bookingId} to 25/12/2024"`
            );
          }
        } else {
          await sendWhatsAppNotification(
            phoneNumber,
            '❓ To reschedule, please provide your booking ID.\n\nFormat: "Reschedule BOOK-XXXXX to DD/MM/YYYY"'
          );
        }
        break;

      case 'cancel':
        if (parsed.bookingId) {
          await sendWhatsAppNotification(
            phoneNumber,
            `❌ Cancellation Request Received\n\nBooking ID: ${parsed.bookingId}\n\nOur team will process your cancellation. You'll receive a confirmation within 24 hours.\n\nFor urgent requests, call: +1-XXX-XXX-XXXX`
          );

          // TODO: Implement cancellation logic
        } else {
          await sendWhatsAppNotification(
            phoneNumber,
            '❓ To cancel, please provide your booking ID.\n\nFormat: "Cancel BOOK-XXXXX"'
          );
        }
        break;

      case 'query':
        await sendWhatsAppNotification(
          phoneNumber,
          `👋 Hi! How can I help you today?\n\n📝 You can:\n• Check booking status\n• Reschedule your trip\n• Request cancellation\n• Get customer support\n\n💻 Visit: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard\n📞 Call: +1-XXX-XXX-XXXX`
        );
        break;

      default:
        await sendWhatsAppNotification(
          phoneNumber,
          `👋 Thanks for your message!\n\nI can help you with:\n• Rescheduling bookings\n• Cancellations\n• Booking inquiries\n\nPlease specify what you need help with, or visit: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
        );
    }

    // Respond with empty TwiML to acknowledge receipt
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle GET request for webhook verification
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'WhatsApp webhook is active',
    timestamp: new Date().toISOString()
  });
}
