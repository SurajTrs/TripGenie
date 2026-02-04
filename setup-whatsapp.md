# Quick Start: WhatsApp Integration Setup

## 🚀 5-Minute Setup Guide

### Step 1: Get Twilio Credentials (2 minutes)

1. **Sign up for Twilio:**
   - Visit: https://www.twilio.com/try-twilio
   - Sign up with your email
   - Verify your phone number

2. **Access WhatsApp Sandbox:**
   - Go to: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
   - You'll see a sandbox number like: `+1 415 523 8886`
   - And a code like: `join <word>-<word>`

3. **Activate Sandbox:**
   - Open WhatsApp on your phone
   - Send the join message to the sandbox number
   - Example: Send `join rocket-banana` to `+1 415 523 8886`
   - You'll receive a confirmation message

### Step 2: Get Your API Credentials (1 minute)

1. In Twilio Console: https://console.twilio.com/
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy both values

### Step 3: Update Environment Variables (1 minute)

Open `.env.local` and update these values:

```env
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd  # Replace with your Account SID
TWILIO_AUTH_TOKEN=your_auth_token_here                # Replace with your Auth Token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886         # Your sandbox number
NEXT_PUBLIC_BASE_URL=http://localhost:3000           # Already set
```

### Step 4: Test It! (1 minute)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Make a test booking:**
   - Use your real phone number in international format
   - Example: `+919876543210` for India
   - Example: `+14155551234` for USA

3. **Check WhatsApp:**
   - You should receive a booking confirmation message! ✅

---

## 📱 Expected WhatsApp Messages

### Booking Confirmation
```
✅ Booking Confirmed - TravixAI

🎫 Booking ID: TRIP-1234567890
👤 Name: John Doe

📍 From: Mumbai
📍 To: Delhi
📅 Date: 2024-12-25

🚀 Transport: Flight
Flight: AI-202
PNR: ABC123

🏨 Hotel: Grand Plaza Hotel

💰 Total: ₹15,000
💳 Payment: Paid

Thank you for choosing TravixAI! 🌟
Have a wonderful trip!

Need help? Reply to this message.
```

### Payment Confirmation
```
💳 Payment Successful - TravixAI

✅ Your payment has been processed!

🎫 Booking ID: TRIP-1234567890
💰 Amount Paid: ₹15,000
💳 Payment Method: card
🔐 Transaction ID: pi_1234567890

Your tickets will be sent shortly.

Questions? Reply to this message.
```

---

## 🧪 Testing Incoming Messages

To test rescheduling and support features:

1. **Send a message to the sandbox number from your WhatsApp:**
   ```
   Reschedule BOOK-123456 to 30/12/2024
   ```

2. **You should receive a response:**
   ```
   🔄 Rescheduling Request Received

   Booking ID: BOOK-123456
   New Date: 30/12/2024

   We're processing your request...
   ```

---

## 🔧 Common Issues & Fixes

### Issue: "Not receiving messages"
✅ **Fix:**
- Ensure you've sent the "join" message to activate sandbox
- Check phone number format: `+919876543210` ✅ NOT `9876543210` ❌
- Verify credentials in `.env.local` are correct

### Issue: "Twilio client not initialized"
✅ **Fix:**
- Restart your dev server after updating `.env.local`
- Check for typos in environment variable names
- Ensure no extra spaces in `.env.local`

### Issue: "Phone number not allowed"
✅ **Fix:**
- In sandbox mode, only verified numbers can receive messages
- Add your test number in Twilio Console → Phone Numbers → Verified Caller IDs

---

## 🌐 Setup Webhook for Incoming Messages

To receive and respond to WhatsApp messages:

### Using ngrok (for local testing):

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Configure in Twilio:**
   - Go to: https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox
   - Set "When a message comes in" to:
     ```
     https://abc123.ngrok.io/api/webhooks/whatsapp
     ```
   - HTTP Method: **POST**
   - Save

5. **Test it:**
   - Send "Hello" to your sandbox number
   - You should get a response! 🎉

---

## ✅ Checklist

Before you start:
- [ ] Twilio account created
- [ ] WhatsApp sandbox activated (sent join message)
- [ ] Copied Account SID and Auth Token
- [ ] Updated `.env.local` file
- [ ] Restarted dev server (`npm run dev`)
- [ ] Phone number in international format
- [ ] Made test booking
- [ ] Received WhatsApp confirmation ✅

Advanced:
- [ ] ngrok installed (for webhook testing)
- [ ] Webhook URL configured in Twilio
- [ ] Tested incoming message handling
- [ ] Verified rescheduling feature

---

## 💰 Cost Estimate

**Sandbox (Testing):** FREE ✅

**Production:**
- ~$0.005 per message
- For 1000 bookings/month:
  - 1000 booking confirmations = $5
  - 1000 payment confirmations = $5
  - **Total: ~$10/month**

---

## 📚 Next Steps

1. ✅ Complete the 5-minute setup above
2. ✅ Test with real bookings
3. ✅ Set up webhook for incoming messages
4. ✅ Read full guide: `WHATSAPP_INTEGRATION_GUIDE.md`
5. ✅ Apply for WhatsApp Business number (for production)

---

## 🆘 Need Help?

- 📖 Full Documentation: See `WHATSAPP_INTEGRATION_GUIDE.md`
- 🔗 Twilio WhatsApp Docs: https://www.twilio.com/docs/whatsapp
- 💬 Twilio Support: https://support.twilio.com/

---

**Happy Coding! 🎉**
