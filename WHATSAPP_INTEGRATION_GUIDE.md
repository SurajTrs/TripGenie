# WhatsApp Integration Guide for TravixAI

This guide will help you set up WhatsApp notifications for your TravixAI travel booking platform.

## Overview

The WhatsApp integration enables:
- ✅ Booking confirmations sent via WhatsApp
- 💳 Payment confirmation notifications
- 🎫 Ticket delivery through WhatsApp
- 🔄 Rescheduling requests via WhatsApp messages
- 📞 Customer support through WhatsApp

## Setup Instructions

### Option 1: Twilio WhatsApp Business API (Recommended)

#### Step 1: Create a Twilio Account

1. Go to [Twilio.com](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Verify your email and phone number

#### Step 2: Get WhatsApp Sandbox Access

For testing (free):
1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to **Messaging** → **Try it out** → **Send a WhatsApp message**
3. You'll see a sandbox number (e.g., `+1 415 523 8886`)
4. Follow the instructions to join the sandbox by sending a WhatsApp message to the sandbox number

#### Step 3: Get Your Credentials

1. In the Twilio Console, go to **Account** → **API keys & tokens**
2. Copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
   - **WhatsApp Sandbox Number** (from the WhatsApp sandbox page)

#### Step 4: Update Environment Variables

Update your `.env.local` file with the credentials:

```env
# WhatsApp Integration (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Step 5: Configure Webhook for Incoming Messages

1. In Twilio Console, go to **Messaging** → **Settings** → **WhatsApp sandbox settings**
2. Set the **When a message comes in** webhook to:
   ```
   https://yourdomain.com/api/webhooks/whatsapp
   ```
   For local testing with ngrok:
   ```
   https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp
   ```
3. Set the HTTP method to **POST**

#### Step 6: Test Your Integration

Run your development server:
```bash
npm run dev
```

Test booking confirmation:
1. Make a test booking through your app
2. Ensure the phone number is in international format: `+1234567890`
3. Check WhatsApp for the confirmation message

---

### Option 2: WhatsApp Business Cloud API (Production)

For production use with your own WhatsApp Business number:

#### Step 1: Create a Meta Developer Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create an account and verify your business

#### Step 2: Create a WhatsApp Business App

1. In the Meta Developer Dashboard, click **Create App**
2. Select **Business** as the app type
3. Add **WhatsApp** product to your app

#### Step 3: Set Up WhatsApp Business Account

1. Complete business verification (required for production)
2. Add a phone number to your WhatsApp Business Account
3. Get your:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
   - **Access Token**

#### Step 4: Update Code for Meta API

Create a new file `lib/whatsapp-meta.ts` (alternative implementation):

```typescript
// This is an alternative to the Twilio implementation
// You would need to update imports in your booking routes

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.META_WHATSAPP_ACCESS_TOKEN;

export async function sendWhatsAppMessage(to: string, message: string) {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace('+', ''),
        type: 'text',
        text: { body: message }
      })
    }
  );

  return response.json();
}
```

---

## Phone Number Format

**IMPORTANT:** Phone numbers must be in international format:
- ✅ Correct: `+919876543210` (India)
- ✅ Correct: `+14155551234` (USA)
- ❌ Wrong: `9876543210`
- ❌ Wrong: `+91 98765 43210`

Update your user registration/booking forms to collect phone numbers in this format.

---

## Features Implemented

### 1. Booking Confirmation
When a booking is successfully completed, customers receive:
- Booking ID
- Travel details (from/to/date)
- Transport information (flight/train/bus number)
- Hotel details
- Total amount paid
- Payment status

**Location:** [app/api/book-trip/route.ts:287-339](app/api/book-trip/route.ts#L287-L339)

### 2. Payment Confirmation
After successful payment via Stripe, customers receive:
- Payment amount
- Payment method
- Transaction ID
- Booking ID reference

**Location:** [app/api/webhooks/stripe/route.ts:43-75](app/api/webhooks/stripe/route.ts#L43-L75)

### 3. Rescheduling via WhatsApp
Customers can send messages like:
- "Reschedule BOOK-ABC123 to 25/12/2024"
- "Change date for BOOK-ABC123"

The system automatically parses and processes these requests.

**Location:** [app/api/webhooks/whatsapp/route.ts](app/api/webhooks/whatsapp/route.ts)

### 4. Ticket Delivery
Send booking tickets as PDF attachments via WhatsApp.

**Location:** [lib/whatsapp.ts:99-127](lib/whatsapp.ts#L99-L127)

---

## Local Testing with ngrok

Since WhatsApp webhooks need a public URL, use ngrok for local testing:

### Step 1: Install ngrok
```bash
npm install -g ngrok
```

### Step 2: Start Your Dev Server
```bash
npm run dev
```

### Step 3: Start ngrok Tunnel
```bash
ngrok http 3000
```

### Step 4: Configure Webhook
Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and set it in Twilio:
```
https://abc123.ngrok.io/api/webhooks/whatsapp
```

---

## Testing Checklist

- [ ] Environment variables configured in `.env.local`
- [ ] Twilio account created and sandbox activated
- [ ] Test phone number added to sandbox (sent join message)
- [ ] Webhook URL configured in Twilio console
- [ ] Made a test booking with valid phone number
- [ ] Received WhatsApp booking confirmation
- [ ] Completed payment and received payment confirmation
- [ ] Sent rescheduling request via WhatsApp
- [ ] Received appropriate responses

---

## Troubleshooting

### Issue: Not receiving WhatsApp messages

**Solutions:**
1. Check if phone number is in correct format (`+1234567890`)
2. For sandbox: Ensure you've sent the join message to activate sandbox
3. Verify Twilio credentials in `.env.local`
4. Check Twilio console logs for errors
5. Ensure your phone number is registered with Twilio (for sandbox)

### Issue: Webhook not receiving messages

**Solutions:**
1. Verify webhook URL is correct in Twilio console
2. Check if ngrok tunnel is active (for local testing)
3. Look at Twilio webhook logs for error details
4. Ensure webhook endpoint returns proper TwiML response

### Issue: "Twilio client not initialized" error

**Solutions:**
1. Check if `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are set
2. Restart your development server after updating `.env.local`
3. Ensure there are no spaces in the environment variables

---

## Production Deployment

### Before Going Live:

1. **Apply for Twilio WhatsApp Business Profile:**
   - Go through Twilio's approval process
   - This gives you a dedicated WhatsApp Business number
   - Costs: Pay-as-you-go pricing

2. **Update Environment Variables:**
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+your_approved_number
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

3. **Set Production Webhook:**
   - Update webhook URL to your production domain
   - Enable HTTPS (required for production)

4. **Add Stripe Webhook Secret:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

---

## Pricing

### Twilio WhatsApp Pricing (as of 2024):
- **User-initiated conversations:** $0.005 - $0.042 per message (varies by country)
- **Business-initiated conversations:** $0.0085 - $0.068 per conversation
- India: ~$0.005 per message
- USA: ~$0.005 per message

**Estimated costs for 1000 bookings/month:**
- 1000 booking confirmations = $5
- 1000 payment confirmations = $5
- **Total: ~$10/month**

---

## Next Steps

1. ✅ Complete Twilio setup and test in sandbox
2. ✅ Test all WhatsApp features (booking, payment, rescheduling)
3. ✅ Implement customer support message handling
4. ✅ Add WhatsApp button to your website
5. ✅ Apply for WhatsApp Business approval for production
6. ✅ Monitor message delivery rates and optimize templates

---

## Support

If you need help:
- 📧 Email: your-support@email.com
- 📖 Twilio Docs: https://www.twilio.com/docs/whatsapp
- 💬 GitHub Issues: [Your Repo Issues]

---

## File Structure

```
app/
├── api/
│   ├── book-trip/
│   │   └── route.ts          # Booking API with WhatsApp integration
│   └── webhooks/
│       ├── stripe/
│       │   └── route.ts      # Stripe webhook with payment notifications
│       └── whatsapp/
│           └── route.ts      # WhatsApp incoming message handler
lib/
└── whatsapp.ts               # WhatsApp service module
```

---

## License

MIT License - Feel free to use and modify as needed.
